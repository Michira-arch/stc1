import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Sparkles } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateLeaderboardModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [entityType, setEntityType] = useState('thing');
    const [themeColor, setThemeColor] = useState('#F59E0B');
    const [icon, setIcon] = useState('🏆');
    const [loading, setLoading] = useState(false);
    const { showToast } = useApp();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Generate basic slug
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

            // Construct metadata
            const metadata = {
                theme_color: themeColor,
                icon: icon,
                cover_image: null // Can be added later
            };

            const { error } = await supabase.from('leaderboards').insert({
                title,
                description,
                entity_type: entityType,
                slug,
                metadata
            });

            if (error) throw error;

            showToast('Leaderboard created!', 'success');
            onSuccess();
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setEntityType('thing');
            setThemeColor('#F59E0B');
            setIcon('🏆');
        } catch (error: any) {
            console.error('Error creating leaderboard:', error);
            showToast(error.message || 'Failed to create leaderboard', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-[#1A1D21] rounded-[32px] p-0 shadow-2xl overflow-hidden"
                    >
                        {/* Header Gradient */}
                        <div className="h-32 w-full relative" style={{ background: `linear-gradient(to bottom right, ${themeColor}, ${themeColor}dd)` }}>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl bg-white dark:bg-[#25282e] flex items-center justify-center shadow-lg text-4xl border-4 border-white dark:border-[#1A1D21]">
                                {icon}
                            </div>
                        </div>

                        <div className="px-6 pt-12 pb-6">
                            <h2 className="text-2xl font-black text-center mb-1 text-slate-900 dark:text-white">New Leaderboard</h2>
                            <p className="text-center text-slate-500 text-sm mb-6 font-medium">Create a new ranking category for the campus.</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Best Dorm Rooms"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#25282e] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold placeholder:font-normal placeholder:text-slate-400"
                                        required
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What are we ranking today?"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#25282e] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-24"
                                        maxLength={100}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Icon (Emoji)</label>
                                        <input
                                            type="text"
                                            value={icon}
                                            onChange={(e) => setIcon(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#25282e] text-center text-2xl outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            maxLength={2}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Theme Color</label>
                                        <div className="relative overflow-hidden rounded-xl h-[52px] bg-slate-100 dark:bg-[#25282e]">
                                            <input
                                                type="color"
                                                value={themeColor}
                                                onChange={(e) => setThemeColor(e.target.value)}
                                                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Item Type</label>
                                    <div className="relative">
                                        <select
                                            value={entityType}
                                            onChange={(e) => setEntityType(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#25282e] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                        >
                                            <option value="person">Person (Lecturer, Student)</option>
                                            <option value="place">Place (Dorm, Spot)</option>
                                            <option value="food">Food / Drink</option>
                                            <option value="thing">Thing / Object / Project</option>
                                            <option value="activity">Activity / Event</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                <CarvedButton
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 mt-4 font-bold text-lg text-white flex items-center justify-center gap-2"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    {loading ? 'Creating...' : (
                                        <>
                                            <Sparkles size={20} />
                                            Start Leaderboard
                                        </>
                                    )}
                                </CarvedButton>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
