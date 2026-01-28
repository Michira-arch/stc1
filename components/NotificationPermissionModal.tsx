import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { CarvedButton } from './CarvedButton';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onEnable: () => void;
}

export const NotificationPermissionModal: React.FC<Props> = ({ isOpen, onClose, onEnable }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-ceramic-base dark:bg-obsidian-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/20 overflow-hidden"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg mb-4">
                                <Bell size={32} fill="currentColor" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                                Stay Connected
                            </h3>

                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                Enable push notifications to get instant updates on campus stories, blind dates, and community announcements.
                            </p>

                            <div className="w-full space-y-3">
                                <CarvedButton
                                    onClick={onEnable}
                                    className="w-full py-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-base"
                                >
                                    Enable Notifications
                                </CarvedButton>

                                <button
                                    onClick={onClose}
                                    className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
