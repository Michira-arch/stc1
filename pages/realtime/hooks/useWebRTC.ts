import { useEffect, useRef, useState, useCallback, MutableRefObject } from 'react';
import { supabase } from '../../../store/supabaseClient';
import { User } from '../../../types';
import { RealtimeChannel } from '@supabase/supabase-js';

// ICE Servers (STUN). TURN is needed for production behind strict NATs.
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

interface Peer {
    userId: string;
    connection: RTCPeerConnection;
}

interface UseWebRTCReturn {
    joinRoom: (localStream: MediaStream) => Promise<void>;
    leaveRoom: () => void;
    remoteStreams: Record<string, MediaStream>;
    channelRef: MutableRefObject<RealtimeChannel | null>;
}

export const useWebRTC = (roomId: string, currentUser: User): UseWebRTCReturn => {
    const [peers, setPeers] = useState<Record<string, Peer>>({});
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const localStreamRef = useRef<MediaStream | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Keep track of connections in refs to avoid closure staleness in callbacks
    const peersRef = useRef<Record<string, Peer>>({});

    const createPeerConnection = (targetUserId: string, initiator: boolean) => {
        if (peersRef.current[targetUserId]) return peersRef.current[targetUserId].connection;

        console.log(`Creating connection to ${targetUserId}. Initiator: ${initiator}`);

        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        // Handle ICE Candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                channelRef.current?.send({
                    type: 'broadcast',
                    event: 'ice-candidate',
                    payload: { candidate: event.candidate, to: targetUserId, from: currentUser.id }
                });
            }
        };

        // Handle Remote Stream
        pc.ontrack = (event) => {
            console.log(`Received track from ${targetUserId}`);
            const stream = event.streams[0];
            setRemoteStreams(prev => ({ ...prev, [targetUserId]: stream }));
        };

        const peerObj = { userId: targetUserId, connection: pc };
        peersRef.current[targetUserId] = peerObj;
        setPeers(prev => ({ ...prev, [targetUserId]: peerObj }));

        // If initiator, create Offer
        if (initiator) {
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    channelRef.current?.send({
                        type: 'broadcast',
                        event: 'sdp-offer',
                        payload: { sdp: pc.localDescription, to: targetUserId, from: currentUser.id }
                    });
                })
                .catch(e => console.error('Error creating offer:', e));
        }

        return pc;
    };

    const handleSignalingData = async (payload: any) => {
        const { from, to } = payload;
        if (to !== currentUser.id) return; // Not for me

        // Auto-accept unknown peers (Mesh logic)
        const pc = peersRef.current[from]?.connection || createPeerConnection(from, false);

        switch (payload.type) {
            case 'sdp-offer':
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                channelRef.current?.send({
                    type: 'broadcast',
                    event: 'sdp-answer',
                    payload: { sdp: pc.localDescription, to: from, from: currentUser.id }
                });
                break;

            case 'sdp-answer':
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                break;

            case 'ice-candidate':
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                } catch (e) {
                    console.error("Error adding ice candidate:", e);
                }
                break;
        }
    };

    const joinRoom = useCallback(async (localStream: MediaStream) => {
        localStreamRef.current = localStream;

        // Subscribe to Room Channel
        channelRef.current = supabase.channel(`room:${roomId}`, {
            config: {
                presence: {
                    key: currentUser.id,
                },
            },
        });

        channelRef.current
            .on('presence', { event: 'sync' }, () => {
                const state = channelRef.current?.presenceState();
                console.log('Presence Sync:', state);

                Object.values(state || {}).flat().forEach((p: any) => {
                    const remoteUserId = p.chat_user_ref?.userId || p.userId;
                    if (remoteUserId && remoteUserId !== currentUser.id) {
                        // Deterministic: If my ID is greater, I initiate.
                        // This handles simultaneous joins (Blind Date) where both see 'sync'.
                        if (currentUser.id > remoteUserId) {
                            console.log(`[Sync] Initiating connection to ${remoteUserId}`);
                            createPeerConnection(remoteUserId, true);
                        }
                    }
                });
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                newPresences.forEach((p: any) => {
                    const remoteUserId = p.chat_user_ref?.userId || p.userId;
                    if (remoteUserId && remoteUserId !== currentUser.id) {
                        // Same rule: Only initiate if I'm the designated offerer
                        if (currentUser.id > remoteUserId) {
                            console.log(`[Join] Initiating connection to ${remoteUserId}`);
                            createPeerConnection(remoteUserId, true);
                        }
                    }
                });
            })
            .on('broadcast', { event: 'sdp-offer' }, ({ payload }) => handleSignalingData({ ...payload, type: 'sdp-offer' }))
            .on('broadcast', { event: 'sdp-answer' }, ({ payload }) => handleSignalingData({ ...payload, type: 'sdp-answer' }))
            .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => handleSignalingData({ ...payload, type: 'ice-candidate' }))
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Announce myself
                    await channelRef.current?.track({
                        online_at: new Date().toISOString(),
                        userId: currentUser.id,
                    });
                }
            });

    }, [roomId, currentUser.id]);

    const leaveRoom = () => {
        channelRef.current?.unsubscribe();
        Object.values(peersRef.current).forEach((p: Peer) => p.connection.close());
        setPeers({});
        setRemoteStreams({});
    };

    return { joinRoom, leaveRoom, remoteStreams, channelRef };
};
