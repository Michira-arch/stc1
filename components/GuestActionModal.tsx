import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, LogIn } from 'lucide-react';
import { CarvedButton } from './CarvedButton';
import { useScrollLock } from '../src/hooks/useScrollLock';

interface GuestActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
    onSignup: () => void;
    actionName: string; // e.g., "post a story", "comment"
}

export const GuestActionModal: React.FC<GuestActionModalProps> = ({ isOpen, onClose, onLogin, onSignup, actionName }) => {
    useScrollLock(isOpen);
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-200/60 dark:bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-ceramic-base dark:bg-obsidian-surface rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mt-4 mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ceramic-base dark:bg-obsidian-base neu-convex flex items-center justify-center text-emerald-500">
                                <UserPlus size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Join the Conversation</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 px-4">
                                Please sign in or create an account to {actionName}.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <CarvedButton
                                onClick={onLogin}
                                className="w-full py-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm"
                            >
                                <LogIn size={18} className="mr-2" /> Sign In
                            </CarvedButton>

                            <CarvedButton
                                onClick={onSignup}
                                className="w-full py-3 font-bold text-slate-600 dark:text-slate-300 text-sm"
                            >
                                Create Account
                            </CarvedButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
