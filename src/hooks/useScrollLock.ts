import { useEffect } from 'react';

export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (isLocked) {
            // Save current overflow style
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';

            // Cleanup function to restore original style
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isLocked]);
};
