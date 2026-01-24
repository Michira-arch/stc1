import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { Logo } from '../../components/Logo';
import { useApp } from '../../store/AppContext';
interface Props {
    onNavigate: (page: 'login' | 'signup' | 'forgot-password' | 'feed') => void;
}

export const Login: React.FC<Props> = ({ onNavigate }) => {
    const { loginAsGuest, login } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login();
        onNavigate('feed');
    };

    const handleGuest = () => {
        loginAsGuest();
        onNavigate('feed');
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
                    <h2 className="text-2xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">Welcome Back</h2>
                    <p className="text-center text-slate-500 text-sm mb-8">Sign in to continue your journey</p>

                    <form onSubmit={handleLogin} className="space-y-6">
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

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-12 pr-4 py-4 rounded-xl outline-none text-slate-700 dark:text-slate-200
                         bg-ceramic-base dark:bg-obsidian-surface
                         shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]
                         dark:shadow-[inset_4px_4px_8px_#151618,inset_-4px_-4px_8px_#35363e]
                         transition-shadow focus:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => onNavigate('forgot-password')}
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <CarvedButton type="submit" className="w-full py-4 font-bold text-lg text-emerald-600 dark:text-emerald-400">
                            Sign In <ArrowRight className="ml-2 inline" size={20} />
                        </CarvedButton>

                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <CarvedButton type="button" onClick={handleGuest} className="w-full py-3 text-sm font-bold text-slate-500">
                                Continue as Guest
                            </CarvedButton>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Don't have an account?{' '}
                        <button
                            onClick={() => onNavigate('signup')}
                            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            Create Account
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
