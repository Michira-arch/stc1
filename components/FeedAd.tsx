import React, { useEffect, useMemo, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRandomAdAnimation } from '../src/hooks/useRandomAdAnimation';
import { WalkingBot, GemLoader, CandleScene } from './AdFallbacks';

// ── Session seed (same logic as useRandomAdAnimation) ───────────────────────
const SESSION_SEED = Math.floor(Date.now() / 1000);

// The three rich CSS/SVG cartoon fallbacks
const FALLBACK_POOL = [WalkingBot, GemLoader, CandleScene] as const;

/** Pick a rich cartoon fallback deterministically per card+session. */
function useFallbackAnimation(cardId: string | number) {
    return useMemo(() => {
        const hash = String(cardId)
            .split('')
            .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        return FALLBACK_POOL[(hash + SESSION_SEED) % FALLBACK_POOL.length];
    }, [cardId]);
}

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

interface FeedAdProps {
    /** Unique identifier so the same slot always picks the same cartoon. */
    cardId: string | number;
}

const FALLBACK_HEIGHT = 240; // px — keeps the card height stable while loading

// FallbackSpinner removed — rich cartoon components are used instead.

// ── Cartoon placeholder shown while the real ad loads ────────
const AdPlaceholder: React.FC<{ cardId: string | number }> = ({ cardId }) => {
    const animation = useRandomAdAnimation(cardId);
    const FallbackAnim = useFallbackAnimation(cardId);

    const [animData, setAnimData] = useState<object | null>(null);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setAnimData(null);
        setLoadError(false);

        fetch(animation.src)
            .then((r) => {
                if (!r.ok) throw new Error('Failed to load');
                return r.json();
            })
            .then((data) => { if (!cancelled) setAnimData(data); })
            .catch(() => { if (!cancelled) setLoadError(true); });

        return () => { cancelled = true; };
    }, [animation.src]);

    return (
        <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-3 overflow-hidden"
            style={{ minHeight: FALLBACK_HEIGHT }}
        >
            {/* Lottie if loaded, rich CSS/SVG cartoon as fallback */}
            <div className="flex items-center justify-center w-full">
                {animData && !loadError ? (
                    <Lottie
                        animationData={animData}
                        loop
                        autoplay
                        style={{ width: 144, height: 144 }}
                    />
                ) : (
                    // Rich cartoon — always visible immediately, no loading wait
                    <FallbackAnim />
                )}
            </div>

            {/* Label pulses whether we're showing Lottie or the CSS fallback */}
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-xs text-slate-400 dark:text-slate-500 text-center font-medium tracking-wide px-4"
            >
                {animation.label}
            </motion.p>
        </motion.div>
    );
};

// ── Main FeedAd component ─────────────────────────────────────
export const FeedAd: React.FC<FeedAdProps> = ({ cardId }) => {
    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
        if (pushed.current) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
        } catch (e) {
            console.warn('AdSense push failed:', e);
        }

        // Poll the <ins> element to detect when AdSense fills it.
        // AdSense sets data-ad-status="filled" or injects an <iframe> when ready.
        const interval = setInterval(() => {
            const ins = adRef.current;
            if (!ins) return;
            const status = ins.getAttribute('data-ad-status');
            const hasFill = ins.querySelector('iframe') !== null;
            if (status === 'filled' || hasFill) {
                setAdLoaded(true);
                clearInterval(interval);
            }
            // If AdSense marks it "unfilled" (e.g. no ads available), hide placeholder
            if (status === 'unfilled') {
                clearInterval(interval);
            }
        }, 500);

        // Cap at 10 seconds — stop polling even if ad never loads
        const timeout = setTimeout(() => clearInterval(interval), 10_000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            className="snap-start scroll-m-4 mb-8 rounded-[2rem] bg-ceramic-base dark:bg-obsidian-surface neu-convex overflow-hidden"
            aria-label="Sponsored content"
        >
            {/* Sponsored label */}
            <div className="flex items-center gap-1.5 pt-5 px-5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-obsidian-highlight neu-concave">
                    Sponsored
                </span>
            </div>

            {/* Stacked: placeholder fades out, ad fades in */}
            <div className="relative min-h-[180px]">
                <AnimatePresence mode="wait">
                    {!adLoaded && (
                        <AdPlaceholder key={`placeholder-${cardId}`} cardId={cardId} />
                    )}
                </AnimatePresence>

                {/* AdSense <ins> is always in the DOM, hidden until filled */}
                <motion.div
                    animate={{ opacity: adLoaded ? 1 : 0, height: adLoaded ? 'auto' : 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden px-5 pb-5"
                >
                    <ins
                        ref={adRef}
                        className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-format="fluid"
                        data-ad-layout-key="-6d+ef+1v-2l-b"
                        data-ad-client="ca-pub-7601838571315523"
                        data-ad-slot="1136804186"
                    />
                </motion.div>
            </div>
        </div>
    );
};
