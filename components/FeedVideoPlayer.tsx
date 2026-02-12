import React, { useRef, useState, useEffect, memo } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface FeedVideoPlayerProps {
    src: string;
    poster?: string;
    onView?: () => void;
}

/**
 * Inline video player for the feed.
 * - Autoplay when 80% visible, auto-pause when <30% visible
 * - Global mute sync: toggling mute on one video affects all
 * - Blurred portrait background fill on desktop (no empty sidebars)
 * - iOS fix: #t=0.001 forces first-frame poster display
 * - Play/Mute glassmorphic buttons capture clicks (stopPropagation)
 * - Tapping anywhere else on the video lets the card click propagate
 * - Tracks cumulative playtime and calls onView after 3s
 */
export const FeedVideoPlayer: React.FC<FeedVideoPlayerProps> = memo(({ src, poster, onView }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const bgVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const { isVideoMuted, setIsVideoMuted } = useApp();

    // View counting refs
    const accumulatedTimeRef = useRef(0);
    const lastTimeRef = useRef(0);
    const hasViewedRef = useRef(false);

    // iOS first-frame fix: append #t=0.001 to force seek to first frame
    const videoSrc = src + (src.includes('#') ? '' : '#t=0.001');

    // Sync muted attribute with global state
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isVideoMuted;
        }
    }, [isVideoMuted]);

    // Autoplay at 80% visible, auto-pause at <30% visible
    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;
        if (!video || !container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.intersectionRatio >= 0.8) {
                    // Autoplay when 80% visible
                    if (video.paused) {
                        video.play().catch(() => { /* autoplay blocked */ });
                    }
                } else if (entry.intersectionRatio < 0.3) {
                    // Pause when less than 30% visible
                    if (!video.paused) {
                        video.pause();
                        setIsPlaying(false);
                    }
                }
            },
            { threshold: [0.0, 0.3, 0.8] }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // Keep background video in sync with main video time (for blurred bg)
    useEffect(() => {
        const video = videoRef.current;
        const bgVideo = bgVideoRef.current;
        if (!video || !bgVideo) return;

        const syncBg = () => {
            if (Math.abs(bgVideo.currentTime - video.currentTime) > 0.5) {
                bgVideo.currentTime = video.currentTime;
            }
        };

        const onPlay = () => { bgVideo.play().catch(() => { }); syncBg(); };
        const onPause = () => { bgVideo.pause(); };
        const onSeeked = () => { syncBg(); };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('seeked', onSeeked);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('seeked', onSeeked);
        };
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
        setIsVideoMuted(!isVideoMuted); // Global toggle
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const pct = (video.currentTime / video.duration) * 100;
        setProgress(isNaN(pct) ? 0 : pct);

        // Track cumulative playtime
        if (!hasViewedRef.current && !video.paused && onView) {
            const now = video.currentTime;
            // Calculate delta since last update (only if positive and reasonable, e.g. < 1s jump)
            const delta = now - lastTimeRef.current;
            if (delta > 0 && delta < 1) {
                accumulatedTimeRef.current += delta;
            }
            lastTimeRef.current = now;

            if (accumulatedTimeRef.current >= 3) {
                onView();
                hasViewedRef.current = true;
            }
        } else {
            // Keep lastTime synced even if paused/viewed, so next play starts correctly
            lastTimeRef.current = video.currentTime;
        }
    };

    return (
        <div
            ref={containerRef}
            className="mb-4 w-full rounded-2xl overflow-hidden relative group
                 border-[3px] border-ceramic-base dark:border-obsidian-base neu-concave"
        >
            {/* Blurred background video — fills empty space for portrait videos on desktop */}
            <video
                ref={bgVideoRef}
                src={videoSrc}
                className="absolute inset-0 w-full h-full object-cover scale-110
                     filter blur-xl opacity-40 pointer-events-none
                     hidden sm:block"
                muted
                playsInline
                loop
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
            />

            {/* Main video */}
            <video
                ref={videoRef}
                src={videoSrc}
                poster={poster}
                className="relative w-full object-contain block
                   max-h-[70vh] min-h-[280px]
                   sm:max-h-[500px]"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => { setIsPlaying(false); setProgress(0); }}
                playsInline
                muted={isVideoMuted}
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

                    {/* Mute button — toggles global state */}
                    <button
                        onClick={toggleMute}
                        className="w-11 h-11 rounded-full 
                       bg-white/15 backdrop-blur-xl border border-white/20
                       flex items-center justify-center
                       shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)]
                       hover:bg-white/25 active:scale-90
                       transition-all duration-200"
                    >
                        {isVideoMuted ? (
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
