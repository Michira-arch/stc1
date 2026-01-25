import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, MonitorUp, Users } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useWebRTC } from './hooks/useWebRTC';
import { CarvedButton } from '../../components/CarvedButton';

interface Props {
    roomId: string;
    onLeave: () => void;
}

export const Room: React.FC<Props> = ({ roomId, onLeave }) => {
    const { currentUser } = useApp();
    const { joinRoom, leaveRoom, remoteStreams, channelRef } = useWebRTC(roomId, currentUser);

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                joinRoom(stream);
            } catch (err) {
                console.error('Error accessing media devices:', err);
            }
        };

        startMedia();

        return () => {
            leaveRoom();
            localStream?.getTracks().forEach(track => track.stop());
        };
    }, [roomId]);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-obsidian-base flex flex-col">
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-obsidian-surface border-b border-white/5">
                <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">Room:</span>
                    <span className="font-mono text-accent">{roomId.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 animate-pulse">
                        REC
                    </span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                {/* Local Feed */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 neu-convex shadow-lg group">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                    />
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-white">
                                {currentUser.name[0]}
                            </div>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-white text-xs backdrop-blur-sm">
                        You {isMuted && '(Muted)'}
                    </div>
                </div>

                {/* Remote Feeds */}
                {Object.entries(remoteStreams).map(([userId, stream]) => (
                    <RemoteVideo key={userId} stream={stream} userId={userId} />
                ))}
            </div>

            {/* Controls Bar */}
            <div className="h-20 bg-obsidian-surface flex items-center justify-center space-x-4 px-4 pb-4">
                <ControlBtn
                    active={!isMuted}
                    onClick={toggleMute}
                    icon={isMuted ? <MicOff /> : <Mic />}
                    variant={isMuted ? 'danger' : 'default'}
                />
                <ControlBtn
                    active={!isVideoOff}
                    onClick={toggleVideo}
                    icon={isVideoOff ? <VideoOff /> : <Video />}
                    variant={isVideoOff ? 'danger' : 'default'}
                />

                <CarvedButton
                    onClick={onLeave}
                    className="!w-16 !h-16 !rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                >
                    <PhoneOff />
                </CarvedButton>

                <ControlBtn
                    active={isChatOpen}
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    icon={<MessageSquare />}
                />
            </div>
        </div>
    );
};

const RemoteVideo: React.FC<{ stream: MediaStream, userId: string }> = ({ stream, userId }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 neu-convex shadow-lg">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-white text-xs backdrop-blur-sm">
                User {userId.slice(0, 4)}
            </div>
        </div>
    );
};

const ControlBtn = ({ active = false, onClick, icon, variant = 'default' }: any) => (
    <CarvedButton
        onClick={onClick}
        className={`!w-12 !h-12 !rounded-full transition-colors duration-200
      ${variant === 'danger' ? 'text-red-500' : 'text-slate-300'}
      ${active ? '' : 'opacity-80'}
    `}
    >
        {icon}
    </CarvedButton>
);
