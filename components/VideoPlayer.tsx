import React, { useRef, useState } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, className = '' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const hideTimeout = useRef<any>(null);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(pct);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pct * videoRef.current.duration;
    };

    const handleFullscreen = () => {
        if (!videoRef.current) return;
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
        } else if ((videoRef.current as any).webkitEnterFullscreen) {
            (videoRef.current as any).webkitEnterFullscreen(); // iOS Safari
        }
    };

    const showControlsTemporarily = () => {
        setShowControls(true);
        clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    return (
        <div
            className={`relative group rounded-2xl overflow-hidden bg-black ${className}`}
            onClick={showControlsTemporarily}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain max-h-[70vh]"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => { setIsPlaying(false); setProgress(0); }}
                playsInline
                preload="metadata"
            />

            {/* Play/Pause overlay */}
            {(!isPlaying || showControls) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center
                       hover:bg-white/30 transition-all active:scale-95"
                    >
                        {isPlaying ? (
                            <Pause size={28} className="text-white" fill="white" />
                        ) : (
                            <Play size={28} className="text-white ml-1" fill="white" />
                        )}
                    </button>
                </div>
            )}

            {/* Bottom controls */}
            {showControls && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    {/* Progress bar */}
                    <div
                        className="w-full h-1.5 bg-white/20 rounded-full mb-2 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
                    >
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-[width] duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="text-white/80 hover:text-white p-1"
                            >
                                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                className="text-white/80 hover:text-white p-1"
                            >
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
                            className="text-white/80 hover:text-white p-1"
                        >
                            <Maximize size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
