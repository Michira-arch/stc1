import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Check, X, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { Logo } from '../../components/Logo';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';

export const SetUsername: React.FC = () => {
    const { currentUser, updateUserName, showToast, setAuthPage } = useApp();
    const [handle, setHandle] = useState('');
    const [checkingHandle, setCheckingHandle] = useState(false);
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            } finally {
                setCheckingHandle(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [handle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (handleAvailable === false) {
            showToast('Please choose a valid and available handle.', 'error');
            return;
        }

        if (handle.length < 3) {
            showToast('Handle must be at least 3 characters long.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ handle: handle })
                .eq('id', currentUser.id);

            if (error) throw error;

            showToast('Username set successfully!', 'success');
            // The App component will detect the new handle and redirect, but we can specifically clear the auth page state too if needed.
            // Relying on App.tsx effect is safer as it acts as the source of truth.
            // But for immediate feedback/UI update we might want to manually trigger something if App.tsx doesn't catch it instantly.
            // Actually, AppContext will update currentUser via realtime or we should manually refresh profile.
            // Let's force a reload of the profile to be sure.
            // We can't easily call fetchProfile here as it is not exposed directly like that, but we can use window.location.reload() as a last resort or rely on App logic.
            // Better: we can update the local state in AppContext if we had a method for it.
            // Types says: updateUserHandle: (handle: string) => Promise<void>;
            // Let's use that instead of direct supabase call!

            // Wait, I made a direct call above. Let's switch to using the context method if possible, or just duplicate the logic here since we need to handle the specific flow?
            // AppContext's updateUserHandle does update the local state. Let's use it.

            // Wait, I can't use updateUserHandle because it also does the update. 
            // Ideally I should utilize the context method.
            // Let's revert the direct call and use the context method.

            // actually, the context method does the update and the state update.
        } catch (err: any) {
            showToast(err.message || 'Failed to set username', 'error');
            setIsSubmitting(false); // Only stop submitting on error
            return;
        }

        // Use the context method to ensure local state is updated immediately
        try {
            const { error } = await supabase.from('profiles').update({ handle }).eq('id', currentUser.id);
            if (error) throw error;

            // We need to force update the local user state so App.tsx knows we are good.
            // Since we don't have a specific "setHandle" exposed that doesn't doing the DB call again (or maybe we do).
            // Let's look at AppContext again. 
            // updateUserHandle does: DB update -> if success -> setLocalState.
            // So I should just call that.
        } catch (e) {
            // handled
        }
        // Actually, let's just use the direct DB call here and *then* we might need to rely on the realtime subscription in AppContext to update the user, 
        // OR we just use window.location.reload() for a hard enforcement which is robust for "once in a lifetime" actions.
        // OR better: we will rely on the `updateUserHandle` from context which does exactly what we want.
    };

    // Redefining handleSubmit to use AppContext
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (handleAvailable !== true) return;

        setIsSubmitting(true);
        try {
            // We use the direct Supabase call here because we want to manually handle success/redirect 
            // and AppContext's updateUserHandle shows toasts which is fine but we want custom flow control.
            // Actually, AppContext's updateUserHandle is fine.
            const { error } = await supabase.from('profiles').update({ handle }).eq('id', currentUser.id);
            if (error) throw error;

            // Force a page reload to ensure all states (including AppContext) are fresh and the app router picks up the new handle correctly eliminating the "SetUsername" screen.
            // This is the safest way to ensure the critical "handle must exist" check passes everywhere.
            window.location.reload();

        } catch (error: any) {
            showToast(error.message || "Failed", 'error');
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex justify-center mb-8">
                    <Logo size={64} />
                    {/* We can hide logo or keep it. Keeping it for brand consistency. */}
                </div>

                <div className="bg-ceramic-base dark:bg-obsidian-surface p-8 rounded-3xl shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#151618,-10px_-10px_20px_#35363e]">
                    <div className="flex items-center justify-center mb-4 text-amber-500">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">One Last Step!</h2>
                    <p className="text-center text-slate-500 text-sm mb-8">
                        You need to set a unique username to continue. This will be your permanent identity on the platform.
                        <br /><span className="text-xs text-red-500 font-bold mt-1 block">Cannot be changed later.</span>
                    </p>

                    <form onSubmit={onSubmit} className="space-y-6">
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
                                placeholder="Choose a handle"
                                className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none text-slate-700 dark:text-slate-200
                         bg-ceramic-base dark:bg-obsidian-surface
                         shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]
                         dark:shadow-[inset_4px_4px_8px_#151618,inset_-4px_-4px_8px_#35363e]
                         transition-shadow focus:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                         ${handle && handleAvailable === false ? 'border-red-500 focus:ring-1 focus:ring-red-500' : ''}`}
                                required
                                minLength={3}
                                pattern="^[a-zA-Z0-9_]+$"
                            />
                        </div>
                        {handle && handleAvailable === false && (
                            <p className="text-xs text-red-500 text-center">Username is already taken or invalid.</p>
                        )}

                        <CarvedButton
                            type="submit"
                            className="w-full py-4 font-bold text-lg text-emerald-600 dark:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!handle || handleAvailable === false || isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (
                                <>Set Username <ArrowRight className="ml-2 inline" size={20} /></>
                            )}
                        </CarvedButton>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
