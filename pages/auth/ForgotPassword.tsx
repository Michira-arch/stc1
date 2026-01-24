import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { Logo } from '../../components/Logo';

interface Props {
    onNavigate: (page: 'login' | 'signup' | 'forgot-password' | 'feed') => void;
}

export const ForgotPassword: React.FC<Props> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSent(true);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex justify-center mb-8">
                    <Logo size={64} />
                </div>

                <div className="bg-ceramic-base dark:bg-obsidian-surface p-8 rounded-3xl shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#151618,-10px_-10px_20px_#35363e]">
                    <div className="flex items-center mb-6">
                        <CarvedButton onClick={() => onNavigate('login')} className="!w-10 !h-10 !rounded-full mr-4">
                            <ArrowLeft size={18} />
                        </CarvedButton>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Reset Password</h2>
                    </div>

                    {!isSent ? (
                        <>
                            <p className="text-slate-500 text-sm mb-8">Enter your email to receive reset instructions.</p>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email Address"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl outline-none text-slate-700 dark:text-slate-200
                             bg-ceramic-base dark:bg-obsidian-surface
                             shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]
                             dark:shadow-[inset_4px_4px_8px_#151618,inset_-4px_-4px_8px_#35363e]
                             transition-shadow focus:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
                                        required
                                    />
                                </div>

                                <CarvedButton type="submit" className="w-full py-4 font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                    Send Link <Send className="ml-2 inline" size={18} />
                                </CarvedButton>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                                <Send size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Check your email</h3>
                            <p className="text-slate-500 text-sm mb-6">We've sent a password reset link to <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span></p>
                            <CarvedButton onClick={() => onNavigate('login')} className="w-full py-3 font-bold">
                                Back to Login
                            </CarvedButton>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
