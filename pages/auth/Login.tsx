import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { Logo } from '../../components/Logo';
import { useApp } from '../../store/AppContext';
import { supabase } from '../../store/supabaseClient';

interface Props {
    onNavigate: (page: 'login' | 'signup' | 'forgot-password' | 'feed') => void;
}

export const Login: React.FC<Props> = ({ onNavigate }) => {
    const { loginAsGuest, showToast } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // AppContext listener will handle state update
            onNavigate('feed');
        } catch (err: any) {
            showToast(err.message || 'Login failed', 'error');
        }
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

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or continue with</span>
                            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                        </div>

                        <CarvedButton
                            type="button"
                            onClick={async () => {
                                try {
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: {
                                            redirectTo: `${window.location.origin}/`,
                                        },
                                    });
                                    if (error) throw error;
                                } catch (err: any) {
                                    showToast(err.message || 'Google login failed', 'error');
                                }
                            }}
                            className="w-full py-3 flex items-center justify-center gap-3 font-semibold text-slate-700 dark:text-slate-200"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
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
