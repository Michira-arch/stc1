import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    activeTab: string;
}

export const OnboardingTour: React.FC<Props> = ({ activeTab }) => {
    const [currentTip, setCurrentTip] = useState<string | null>(null);

    useEffect(() => {
        // We check which tooltips have already been dismissed.
        const checkOnboarding = () => {
            // Determine what to show based on activeTab
            if (activeTab === 'feed' && !localStorage.getItem('onboarding_seen_feed')) {
                setCurrentTip('feed');
            } else if (activeTab === 'explore' && !localStorage.getItem('onboarding_seen_explore')) {
                setCurrentTip('explore');
            } else if (activeTab === 'editor' && !localStorage.getItem('onboarding_seen_editor')) {
                setCurrentTip('editor');
            } else if (activeTab === 'profile' && !localStorage.getItem('onboarding_seen_profile')) {
                setCurrentTip('profile');
            } else {
                setCurrentTip(null);
            }
        };

        // Delay slightly so it doesn't pop up instantly on mount
        const timer = setTimeout(checkOnboarding, 1000);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const dismiss = () => {
        if (currentTip) {
            localStorage.setItem(`onboarding_seen_${currentTip}`, 'true');
            setCurrentTip(null);
        }
    };

    const getTooltipContent = () => {
        switch (currentTip) {
            case 'feed':
                return {
                    title: "Welcome to the Feed!",
                    text: "Swipe down to explore stories, or interact with them directly. Tap images to open full view.",
                    position: "top-24 left-1/2 -translate-x-1/2",
                };
            case 'explore':
                return {
                    title: "Discover Content",
                    text: "Search for specific people, stories, or use the trending tags to find something new.",
                    position: "top-32 left-1/2 -translate-x-1/2",
                };
            case 'editor':
                return {
                    title: "Create a Masterpiece",
                    text: "Switch to 'Pro Mode' for rich text formatting, or attach an audio clip using the microphone!",
                    position: "bottom-40 left-1/2 -translate-x-1/2",
                };
            case 'profile':
                return {
                    title: "Your Identity",
                    text: "Manage your stories, change your settings, or access your STC Apps and games here.",
                    position: "top-32 left-1/2 -translate-x-1/2",
                };
            default:
                return null;
        }
    };

    const content = getTooltipContent();

    return (
        <AnimatePresence>
            {content && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className={`fixed ${content.position} z-50 p-4 bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-[280px] sm:max-w-sm pointer-events-auto`}
                >
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
                    <h3 className="font-bold text-lg text-emerald-500 mb-2 relative z-10">{content.title}</h3>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-4 relative z-10">
                        {content.text}
                    </p>
                    <div className="flex justify-end relative z-10">
                        <button
                            onClick={dismiss}
                            className="px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold rounded-full transition-colors"
                        >
                            Got it!
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
