import React, { useRef, useState, useEffect, memo } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface FeedVideoPlayerProps {
    src: string;
    poster?: string;
}

/**
 * Inline video player for the feed.
 * - Play/Mute glassmorphic buttons capture clicks (stopPropagation)
 * - Tapping anywhere else on the video lets the card click propagate (opens story)
 * - Portrait container on mobile, landscape-tolerant on desktop
 * - Auto-pause when scrolled off-screen via IntersectionObserver
 */
export const FeedVideoPlayer: React.FC<FeedVideoPlayerProps> = memo(({ src, poster }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
    const [progress, setProgress] = useState(0);

    // Auto-pause when off-screen
    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;
        if (!video || !container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting && !video.paused) {
                    video.pause();
                    setIsPlaying(false);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(isNaN(pct) ? 0 : pct);
    };

    return (
        <div
            ref={containerRef}
            className="mb-4 w-full rounded-2xl overflow-hidden relative group
                 border-[3px] border-ceramic-base dark:border-obsidian-base neu-concave"
        >
            {/* Video element — portrait on mobile, natural on desktop */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full object-cover block
                   max-h-[70vh] min-h-[280px]
                   sm:max-h-[500px] sm:object-contain"
                style={{
                    // Force portrait-ish aspect on mobile by using object-cover 
                    // which fills the container height. On larger screens, 
                    // sm:object-contain lets landscape videos show naturally.
                    aspectRatio: 'auto',
                }}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => { setIsPlaying(false); setProgress(0); }}
                playsInline
                muted={isMuted}
                preload="metadata"
                loop
            />

            {/* Glassmorphic controls overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                {/* Play/Pause button */}
                <button
                    onClick={togglePlay}
                    className="pointer-events-auto w-11 h-11 rounded-full 
                     bg-white/15 backdrop-blur-xl border border-white/20
                     flex items-center justify-center
                     shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)]
                     hover:bg-white/25 active:scale-90
                     transition-all duration-200"
                >
                    {isPlaying ? (
                        <Pause size={18} className="text-white drop-shadow-md" fill="white" />
                    ) : (
                        <Play size={18} className="text-white drop-shadow-md ml-0.5" fill="white" />
                    )}
                </button>

                {/* Progress + Mute */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    {/* Thin progress bar */}
                    <div className="w-20 sm:w-32 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-white/80 rounded-full transition-[width] duration-150"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Mute button */}
                    <button
                        onClick={toggleMute}
                        className="w-11 h-11 rounded-full 
                       bg-white/15 backdrop-blur-xl border border-white/20
                       flex items-center justify-center
                       shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)]
                       hover:bg-white/25 active:scale-90
                       transition-all duration-200"
                    >
                        {isMuted ? (
                            <VolumeX size={16} className="text-white drop-shadow-md" />
                        ) : (
                            <Volume2 size={16} className="text-white drop-shadow-md" />
                        )}
                    </button>
                </div>
            </div>

            {/* Large play icon when paused (doesn't capture clicks — lets them fall through to card) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm 
                          flex items-center justify-center
                          border border-white/10
                          shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <Play size={28} className="text-white/90 ml-1" fill="white" fillOpacity={0.9} />
                    </div>
                </div>
            )}
        </div>
    );
});
