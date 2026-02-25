import { useMemo } from 'react';
import { AD_ANIMATIONS, AdAnimation } from '../animations/adAnimations';

/**
 * Session seed — computed ONCE when the module is first imported.
 * Derived from Date.now() so it changes every second across app startups.
 * Using seconds (Math.floor(Date.now() / 1000)) keeps it stable within a
 * single session but different on the next launch.
 */
const SESSION_SEED = Math.floor(Date.now() / 1000);

/**
 * Returns a stable animation for a given cardId that varies per session.
 *
 * - Same cardId + same session  → same animation  (no flicker on re-render)
 * - Same cardId + new session   → different animation (freshness on relaunch)
 *
 * The index is: (cardHash + SESSION_SEED) mod listLength
 */
export function useRandomAdAnimation(cardId: string | number): AdAnimation {
    return useMemo(() => {
        const cardHash = String(cardId)
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);

        const index = (cardHash + SESSION_SEED) % AD_ANIMATIONS.length;
        return AD_ANIMATIONS[index];
    }, [cardId]);
}
