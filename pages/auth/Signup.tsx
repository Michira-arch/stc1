import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Check, X } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { Logo } from '../../components/Logo';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';

interface Props {
    onNavigate: (page: 'login' | 'signup' | 'forgot-password' | 'feed') => void;
}

export const Signup: React.FC<Props> = ({ onNavigate }) => {
    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [checkingHandle, setCheckingHandle] = useState(false);
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

    const { showToast } = useApp();
    const routerNavigate = onNavigate; // Alias to avoid shadowing if needed, but safe here

    useEffect(() => {
        const checkAvailability = async () => {
            if (!handle || handle.length < 3) {
                setHandleAvailable(null);
                return;
            }

            // Basic validation: alphanumeric and underscores only
            if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
                setHandleAvailable(false);
                return;
            }

            setCheckingHandle(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('handle')
                    .eq('handle', handle)
                    .maybeSingle();

                if (error) throw error;

                // If data exists, handle is taken. If null, it's available.
                setHandleAvailable(!data);
            } catch (error) {
                console.error('Error checking handle:', error);
                // Optionally handle error state specifically
            } finally {
                setCheckingHandle(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [handle]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (handleAvailable === false) {
            showToast('Please choose a valid and available handle.', 'error');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        handle: handle || undefined, // Send handle if provided
                        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                showToast('Welcome! Account created.', 'success');
                onNavigate('feed');
            } else if (data.user) {
                // Email confirmation required logic could go here
                showToast('Please check your email to confirm your account.', 'info');
                // stay here or go to login
                onNavigate('login');
            }
        } catch (err: any) {
            showToast(err.message || 'Failed to sign up', 'error');
        }
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
                    <h2 className="text-2xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">Create Account</h2>
                    <p className="text-center text-slate-500 text-sm mb-8">Join the community today</p>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full pl-12 pr-4 py-4 rounded-xl outline-none text-slate-700 dark:text-slate-200
                         bg-ceramic-base dark:bg-obsidian-surface
                         shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]
                         dark:shadow-[inset_4px_4px_8px_#151618,inset_-4px_-4px_8px_#35363e]
                         transition-shadow focus:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
                                required
                            />
                        </div>

                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {checkingHandle ? (
                                    <div className="animate-spin text-slate-400">
                                        <Loader2 size={20} />
                                    </div>
                                ) : handle ? (
                                    handleAvailable ? (
                                        <Check size={20} className="text-green-500" />
                                    ) : (
                                        <X size={20} className="text-red-500" />
                                    )
                                ) : null}
                            </div>
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                placeholder="Handle (optional)"
                                className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none text-slate-700 dark:text-slate-200
                         bg-ceramic-base dark:bg-obsidian-surface
                         shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]
                         dark:shadow-[inset_4px_4px_8px_#151618,inset_-4px_-4px_8px_#35363e]
                         transition-shadow focus:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                         ${handle && handleAvailable === false ? 'border-red-500 focus:ring-1 focus:ring-red-500' : ''}`}
                            />
                        </div>

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

                        <CarvedButton
                            type="submit"
                            className="w-full py-4 font-bold text-lg text-emerald-600 dark:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={handleAvailable === false && handle.length > 0}
                        >
                            Sign Up <ArrowRight className="ml-2 inline" size={20} />
                        </CarvedButton>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Already have an account?{' '}
                        <button
                            onClick={() => onNavigate('login')}
                            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
