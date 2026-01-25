import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SkipForward, Loader2, Video, Mic, VideoOff, MicOff } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useWebRTC } from './hooks/useWebRTC';
import { CarvedButton } from '../../components/CarvedButton';
import { supabase } from '../../store/supabaseClient';

type MatchState = 'IDLE' | 'SEARCHING' | 'MATCHED' | 'CONNECTED';

interface Props {
    onStop: () => void;
}

export const BlindDateRoom: React.FC<Props> = ({ onStop }) => {
    const { currentUser } = useApp();
    const [matchState, setMatchState] = useState<MatchState>('SEARCHING');
    const [targetUserId, setTargetUserId] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null); // Shared room ID for the call

    // We use a "Lobby" channel to find peers
    const lobbyChannelRef = useRef<any>(null);

    // WebRTC hook - only active when we have a roomId
    const { joinRoom, leaveRoom, remoteStreams } = useWebRTC(roomId || 'blind-date-lobby', currentUser);

    // Local media state
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    // -- initialization --
    useEffect(() => {
        startLocalMedia();
        return () => {
            cleanup();
        };
    }, []);

    // -- Matching Logic --
    useEffect(() => {
        if (matchState === 'SEARCHING') {
            joinLobby();
        } else {
            leaveLobby();
        }
    }, [matchState]);

    // -- Room Joining -- 
    useEffect(() => {
        if (matchState === 'MATCHED' && roomId && localStream) {
            // Give a moment for state to settle, then join WebRTC
            // In a real app we'd wait for signaling "ready"
            joinRoom(localStream).then(() => {
                setMatchState('CONNECTED');
            });
        }
    }, [matchState, roomId, localStream]);

    const startLocalMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
        } catch (err) {
            console.error('Error accessing media:', err);
        }
    };

    // Re-attach local stream when video element changes (e.g. switching views)
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localVideoRef.current, localStream, matchState]);


    const joinLobby = () => {
        console.log('Joining Blind Date Lobby...');
        lobbyChannelRef.current = supabase.channel('blind-date-lobby', {
            config: { presence: { key: currentUser.id } }
        });

        lobbyChannelRef.current
            .on('presence', { event: 'sync' }, () => {
                const state = lobbyChannelRef.current.presenceState();
                checkForMatch(state);
            })
            // Listen for direct "match-found" messages
            .on('broadcast', { event: 'match-invite' }, ({ payload }: any) => {
                if (payload.to === currentUser.id && matchState === 'SEARCHING') {
                    console.log('Received match invite from', payload.from);
                    acceptMatch(payload.from, payload.roomId);
                }
            })
            .subscribe(async (status: string) => {
                if (status === 'SUBSCRIBED') {
                    await lobbyChannelRef.current.track({
                        online_at: new Date().toISOString(),
                        userId: currentUser.id,
                        status: 'SEARCHING'
                    });
                }
            });
    };

    const leaveLobby = () => {
        if (lobbyChannelRef.current) {
            lobbyChannelRef.current.unsubscribe();
            lobbyChannelRef.current = null;
        }
    };

    const cleanup = () => {
        leaveRoom();
        leaveLobby();
        localStream?.getTracks().forEach(t => t.stop());
    };

    const checkForMatch = (state: any) => {
        if (matchState !== 'SEARCHING') return;

        const potentialMatches = Object.values(state).flat() as any[];
        // Filter for others who are also SEARCHING
        const candidates = potentialMatches.filter(p =>
            p && p.userId && p.userId !== currentUser.id && p.status === 'SEARCHING'
        );

        if (candidates.length > 0) {
            // Simple logic: If my ID < their ID, I initiate.
            // This prevents race conditions where both try to invite each other.
            // Or we just pick random. Let's try "Initiator" logic.
            const target = candidates[0]; // Just pick the first one for now
            if (currentUser.id < target.userId) {
                initiateMatch(target.userId);
            }
        }
    };

    const initiateMatch = (targetId: string) => {
        const newRoomId = `blind-${currentUser.id}-${targetId}-${Date.now()}`;
        console.log('Initiating match with', targetId, 'Room:', newRoomId);

        // Send invite
        lobbyChannelRef.current?.send({
            type: 'broadcast',
            event: 'match-invite',
            payload: { from: currentUser.id, to: targetId, roomId: newRoomId }
        });

        // Set local state
        setTargetUserId(targetId);
        setRoomId(newRoomId);
        setMatchState('MATCHED');
    };

    const acceptMatch = (initiatorId: string, assignedRoomId: string) => {
        setTargetUserId(initiatorId);
        setRoomId(assignedRoomId);
        setMatchState('MATCHED');
    };

    const handleSkip = () => {
        // Disconnect from current room
        leaveRoom();
        setMatchState('SEARCHING');
        setTargetUserId(null);
        setRoomId(null);
        // Re-join lobby automatically via useEffect
    };

    const handleStop = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        cleanup();
        onStop();
    };

    return (
        <div className="fixed inset-0 z-50 bg-obsidian-base flex flex-col">
            {/* Header / Controls */}
            <div className="h-20 px-6 flex items-center justify-between bg-obsidian-surface border-b border-white/5 z-20">
                <div className="flex items-center gap-4">
                    <CarvedButton onClick={handleStop} className="!w-10 !h-10 !rounded-full text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </CarvedButton>
                    <span className="font-bold text-lg text-slate-200">
                        {matchState === 'SEARCHING' ? 'Looking for a date...' : 'Blind Date'}
                    </span>
                </div>

                {matchState === 'CONNECTED' && (
                    <CarvedButton
                        onClick={handleSkip}
                        className="!px-6 !py-2 !rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
                    >
                        <span className="flex items-center gap-2 font-semibold">
                            Skip <SkipForward className="w-4 h-4" />
                        </span>
                    </CarvedButton>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center p-4">

                {/* Searching State */}
                {matchState === 'SEARCHING' && (
                    <div className="text-center relative z-10">
                        <div className="w-24 h-24 rounded-full border-4 border-pink-500/30 border-t-pink-500 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Finding a match...</h2>
                        <p className="text-slate-400">Please wait while we connect you.</p>

                        {/* Local preview while searching */}
                        <div className="mt-8 relative w-48 h-32 rounded-xl overflow-hidden bg-black/50 mx-auto border border-white/10">
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-50" />
                        </div>
                    </div>
                )}

                {/* Connected State */}
                {(matchState === 'MATCHED' || matchState === 'CONNECTED') && (
                    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
                        {/* Remote Video (The Date) */}
                        <div className="relative rounded-3xl overflow-hidden bg-black/40 neu-convex shadow-2xl flex items-center justify-center">
                            {Object.values(remoteStreams).length > 0 ? (
                                <RemoteVideo stream={Object.values(remoteStreams)[0]} />
                            ) : (
                                <div className="text-slate-500 flex flex-col items-center">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                    <span>Connecting to partner...</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white text-sm backdrop-blur-md">
                                Their Camera
                            </div>
                        </div>

                        {/* Local Video (You) */}
                        <div className="relative rounded-3xl overflow-hidden bg-black/40 neu-convex shadow-2xl">
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white text-sm backdrop-blur-md">
                                You
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const RemoteVideo: React.FC<{ stream: MediaStream }> = ({ stream }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />;
};
