import React, { useEffect, useMemo, useRef, useState, useCallback, Component, type ErrorInfo, type ReactNode } from 'react';
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

/** Check whether AdSense is available on this page. */
function isAdSenseAvailable(): boolean {
    return typeof window !== 'undefined' && Array.isArray(window.adsbygoogle);
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

// ── Error Boundary — catches any AdSense / rendering crash ──────────────────
class AdErrorBoundary extends Component<
    { fallback: ReactNode; children: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: Error, info: ErrorInfo) {
        console.warn('[FeedAd] Component crashed, hiding card:', error.message, info.componentStack);
    }
    render() {
        return this.state.hasError ? this.props.fallback : this.props.children;
    }
}

// ── Cartoon placeholder shown while the real ad loads ────────
const AdPlaceholder: React.FC<{
    cardId: string | number;
    onRenderCheck: (hasContent: boolean) => void;
}> = ({ cardId, onRenderCheck }) => {
    const animation = useRandomAdAnimation(cardId);
    const FallbackAnim = useFallbackAnimation(cardId);
    const containerRef = useRef<HTMLDivElement>(null);

    const [animData, setAnimData] = useState<object | null>(null);
    const [loadError, setLoadError] = useState(false);

    // Fetch Lottie JSON
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

    // Last line of defense: after 2s, check if anything actually rendered visibly.
    // If the content area has no height, report it so the card can be hidden entirely.
    useEffect(() => {
        const timer = setTimeout(() => {
            const el = containerRef.current;
            if (!el) { onRenderCheck(false); return; }
            const contentEl = el.querySelector('[data-anim-content]') as HTMLElement | null;
            if (contentEl) {
                const height = contentEl.getBoundingClientRect().height;
                onRenderCheck(height > 10);
            } else {
                onRenderCheck(false);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [animData, loadError]);

    return (
        <motion.div
            ref={containerRef}
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-3 overflow-hidden"
            style={{ minHeight: FALLBACK_HEIGHT }}
        >
            {/* Lottie if loaded, rich CSS/SVG cartoon as fallback */}
            <div className="flex items-center justify-center w-full" data-anim-content>
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
const FeedAdInner: React.FC<FeedAdProps> = ({ cardId }) => {
    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);
    const [adLoaded, setAdLoaded] = useState(false);
    const [hideCard, setHideCard] = useState(false);

    // Called by AdPlaceholder after it checks whether content rendered visibly
    const handleRenderCheck = useCallback((hasContent: boolean) => {
        if (!hasContent && !adLoaded) {
            // Neither Lottie nor CSS cartoon rendered — hide the entire card
            setHideCard(true);
        }
    }, [adLoaded]);

    useEffect(() => {
        if (pushed.current) return;

        // Don't interact with AdSense at all if the script isn't loaded
        if (!isAdSenseAvailable()) return;

        // Defer the push to give the placeholder time to render first
        const pushTimer = setTimeout(() => {
            if (pushed.current) return;
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                pushed.current = true;
            } catch (e) {
                console.warn('[FeedAd] AdSense push failed:', e);
                // Don't crash — placeholder stays visible
            }
        }, 500);

        // Poll the <ins> element to detect when AdSense fills it.
        const interval = setInterval(() => {
            const ins = adRef.current;
            if (!ins) return;
            try {
                const status = ins.getAttribute('data-ad-status');
                const hasFill = ins.querySelector('iframe') !== null;
                if (status === 'filled' || hasFill) {
                    setAdLoaded(true);
                    setHideCard(false);
                    clearInterval(interval);
                }
                if (status === 'unfilled') {
                    // Ad unavailable — placeholder stays, don't crash
                    clearInterval(interval);
                }
            } catch {
                // Swallow any DOM query errors
                clearInterval(interval);
            }
        }, 500);

        // Cap at 10 seconds — stop polling even if ad never loads
        const timeout = setTimeout(() => clearInterval(interval), 10_000);

        return () => {
            clearTimeout(pushTimer);
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    // Failsafe: if nothing rendered, hide entirely
    if (hideCard && !adLoaded) return null;

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
                        <AdPlaceholder
                            key={`placeholder-${cardId}`}
                            cardId={cardId}
                            onRenderCheck={handleRenderCheck}
                        />
                    )}
                </AnimatePresence>

                {/* AdSense <ins> — only rendered if the script is present */}
                {isAdSenseAvailable() && (
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
                )}
            </div>
        </div>
    );
};

// ── Exported component wrapped in error boundary ────────────────
export const FeedAd: React.FC<FeedAdProps> = ({ cardId }) => (
    <AdErrorBoundary fallback={null}>
        <FeedAdInner cardId={cardId} />
    </AdErrorBoundary>
);
