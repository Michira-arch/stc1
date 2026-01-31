import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Loader2, Plus, Sparkles } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';
import { CreateLeaderboardModal } from './CreateLeaderboardModal';

interface Leaderboard {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    entity_type: string;
}

interface Props {
    onBack: () => void;
    onSelectLeaderboard: (leaderboardId: string, slug: string) => void;
}

export const LeaderboardHome: React.FC<Props> = ({ onBack, onSelectLeaderboard }) => {
    const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { showToast } = useApp();

    useEffect(() => {
        fetchLeaderboards();
    }, []);

    const fetchLeaderboards = async () => {
        try {
            const { data, error } = await supabase
                .from('leaderboards')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeaderboards(data || []);
        } catch (error: any) {
            console.error('Error fetching leaderboards:', error);
            showToast('Failed to load leaderboards', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ceramic-base dark:bg-[#1A1D21] p-6 pt-12">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full">
                        <ArrowLeft size={24} />
                    </CarvedButton>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500">
                        LEADERBOARDS
                    </h1>
                </div>

                <CarvedButton onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 text-amber-600 dark:text-amber-500 font-bold text-sm flex items-center gap-2">
                    <Plus size={18} />
                    Create
                </CarvedButton>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                </div>
            ) : leaderboards.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Trophy className="mx-auto mb-4 opacity-20" size={64} />
                    <p>No leaderboards found.</p>
                    <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 text-amber-500 hover:underline">
                        Create the first one!
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {leaderboards.map((board, index) => (
                        <motion.div
                            key={board.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelectLeaderboard(board.id, board.slug)}
                            className="bg-white dark:bg-[#25282e] p-6 rounded-3xl relative overflow-hidden group cursor-pointer
                            shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#151618,-8px_-8px_16px_#35363e]
                            hover:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:hover:shadow-[inset_4px_4px_8px_#151618,inset_-4px_-4px_8px_#35363e]
                            transition-all duration-300 border border-transparent hover:border-amber-500/20"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Trophy size={80} className="text-amber-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/30">
                                    <Trophy size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">
                                    {board.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {board.description}
                                </p>

                                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                    <Sparkles size={14} />
                                    <span>Vote Now</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <CreateLeaderboardModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchLeaderboards}
            />
        </div>
    );
};
