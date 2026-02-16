import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Check, Mail } from 'lucide-react';
import { CarvedButton } from './CarvedButton';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const StreamingAccessModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'info' | 'contact'>('info');

    const handleAgree = () => {
        setStep('contact');
    };

    const reset = () => {
        setStep('info');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={reset}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-ceramic-base dark:bg-obsidian-surface rounded-3xl p-6 shadow-2xl border border-white/20 overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <button
                            onClick={reset}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-10"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>

                        <div className="relative z-10 text-center">
                            {step === 'info' ? (
                                <>
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-100 to-amber-100 dark:from-red-900/30 dark:to-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                                        <AlertCircle size={32} />
                                    </div>

                                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 mb-2">
                                        Streaming Access
                                    </h3>

                                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-sm">
                                        Streaming is resource-intensive and expensive, so it's not publicly available for everyone right now.
                                        <br /><br />
                                        If you wish to stream, you'll need to cover the associated costs.
                                    </p>

                                    <div className="flex gap-3">
                                        <CarvedButton
                                            onClick={reset}
                                            className="flex-1 !bg-transparent border border-slate-200 dark:border-slate-700 text-slate-500"
                                        >
                                            Cancel
                                        </CarvedButton>
                                        <CarvedButton
                                            onClick={handleAgree}
                                            className="flex-1 font-bold text-accent"
                                        >
                                            I Understand
                                        </CarvedButton>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                                        <Mail size={32} />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                                        Contact Admin
                                    </h3>

                                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
                                        Please contact us to set up your streaming access:
                                    </p>

                                    <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl mb-6 flex items-center justify-between group cursor-pointer"
                                        onClick={() => {
                                            navigator.clipboard.writeText("dispatchatstc@gmail.com");
                                            // Optional: Show a tiny toast or feedback
                                        }}
                                    >
                                        <span className="font-mono text-sm text-slate-700 dark:text-slate-300 select-all">dispatchatstc@gmail.com</span>
                                        <Check size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <CarvedButton
                                        onClick={reset}
                                        className="w-full font-bold text-slate-500"
                                    >
                                        Close
                                    </CarvedButton>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
