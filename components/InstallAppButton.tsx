import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { CarvedButton } from './CarvedButton';
import { Download, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    className?: string;
    variant?: 'banner' | 'settings';
}

export const InstallAppButton: React.FC<Props> = ({ className = '', variant = 'banner' }) => {
    const { installApp, isAppInstalled, deferredPrompt, showToast } = useApp();
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);
    }, []);

    // Don't show if already installed
    if (isAppInstalled) return null;

    // Logic: 
    // If Android/Desktop (deferredPrompt exists) -> Show Install Button -> Calls prompt()
    // If iOS (no prompt) -> Show Install Button -> Opens Modal with Instructions
    // If neither (Desktop random browser without support?) -> Show nothing? Or Instructions?
    // Let's show instructions if no prompt is available but we are not installed.

    if (!deferredPrompt && !isIOS) return null; // Hide if no prompt support and not iOS (likely just not ready or unsupported)

    const handleClick = () => {
        if (deferredPrompt) {
            installApp();
        } else if (isIOS) {
            setShowIOSInstructions(true);
        } else {
            showToast("Install not supported on this browser", "info");
        }
    };

    return (
        <>
            <CarvedButton
                onClick={handleClick}
                className={`${className} ${variant === 'banner' ? '!bg-white/10 !border-white/20' : ''}`}
                variant={variant === 'settings' ? 'primary' : 'default'}
            >
                <Download size={18} className={variant === 'banner' ? 'mr-2' : 'mr-3'} />
                <span className="font-semibold">Install App</span>
            </CarvedButton>

            <AnimatePresence>
                {showIOSInstructions && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowIOSInstructions(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="relative w-full max-w-sm bg-ceramic-base dark:bg-obsidian-surface rounded-3xl p-6 shadow-2xl border border-white/10 mb-4 sm:mb-0"
                        >
                            <h3 className="text-xl font-bold mb-4">Install on iOS</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                To install this app on your iPhone or iPad:
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                        <Share size={20} className="text-blue-500" />
                                    </div>
                                    <div className="text-sm">
                                        Tap the <span className="font-bold text-blue-500">Share</span> button in your browser menu.
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                        <PlusSquare size={20} className="text-slate-800 dark:text-white" />
                                    </div>
                                    <div className="text-sm">
                                        Scroll down and tap <span className="font-bold text-slate-800 dark:text-white">Add to Home Screen</span>.
                                    </div>
                                </div>
                            </div>

                            <CarvedButton onClick={() => setShowIOSInstructions(false)} className="w-full mt-8">
                                Got it
                            </CarvedButton>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
