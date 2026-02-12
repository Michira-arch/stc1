import { useEffect, useRef } from 'react';

interface UseSmartViewProps {
    onView: () => void;
    threshold?: number; // Default 0.8
    duration?: number;  // Default 3000ms
    enabled?: boolean;  // Default true
}

export const useSmartView = ({ onView, threshold = 0.8, duration = 3000, enabled = true }: UseSmartViewProps) => {
    const ref = useRef<HTMLElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasViewedRef = useRef(false);

    useEffect(() => {
        if (!enabled || hasViewedRef.current) return;

        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
                    // Started viewing
                    if (!timerRef.current) {
                        timerRef.current = setTimeout(() => {
                            if (!hasViewedRef.current) {
                                onView();
                                hasViewedRef.current = true;
                            }
                        }, duration);
                    }
                } else {
                    // Stopped viewing - reset timer
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                        timerRef.current = null;
                    }
                }
            },
            { threshold }
        );

        observer.observe(element);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            observer.disconnect();
        };
    }, [onView, threshold, duration, enabled]);

    return ref;
};
