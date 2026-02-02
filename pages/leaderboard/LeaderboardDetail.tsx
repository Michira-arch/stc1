import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Swords, Sparkles, Share2, Info } from 'lucide-react';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';

// Sub-components
import { LeaderboardRankingsList } from './LeaderboardRankingsList';
import { LeaderboardVote } from './LeaderboardVote';

interface Leaderboard {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    entity_type: string;
    metadata: {
        icon?: string;
        theme_color?: string;
        cover_image?: string;
    } | null;
}

interface Props {
    leaderboardId: string;
    onBack: () => void;
}

export const LeaderboardDetail: React.FC<Props> = ({ leaderboardId, onBack }) => {
    const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
    const [activeTab, setActiveTab] = useState<'rankings' | 'vote'>('rankings'); // Default to rankings
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalVotes: 0, candidateCount: 0 });

    useEffect(() => {
        fetchDetails();
    }, [leaderboardId]);

    const fetchDetails = async () => {
        // Fetch Leaderboard
        const { data: lbData } = await supabase
            .from('leaderboards')
            .select('*')
            .eq('id', leaderboardId)
            .single();

        if (lbData) {
            setLeaderboard(lbData as any);

            // Fetch basic stats (parallel if possible but keeping simple for now)
            const { count: voteCount } = await supabase
                .from('ranking_votes')
                .select('*', { count: 'exact', head: true })
                .eq('leaderboard_id', leaderboardId);

            const { count: entityCount } = await supabase
                .from('ranked_entities')
                .select('*', { count: 'exact', head: true })
                .eq('leaderboard_id', leaderboardId);

            setStats({
                totalVotes: voteCount || 0,
                candidateCount: entityCount || 0
            });
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#1A1D21] p-4 space-y-4">
                {/* Skeleton Header */}
                <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-12 w-2/3 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse mx-auto" />
            </div>
        );
    }

    if (!leaderboard) return <div className="p-10 text-center">Leaderboard not found</div>;

    const themeColor = leaderboard.metadata?.theme_color || '#F59E0B'; // Amber default

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#1A1D21] flex flex-col relative overflow-hidden">

            {/* Dynamic Background Mesh */}
            <div
                className="absolute top-0 left-0 right-0 h-[500px] opacity-20 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${themeColor}, transparent 70%)`
                }}
            />

            {/* Header */}
            <div className="relative z-10 px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onBack}
                        className="p-3 -ml-2 rounded-full hover:bg-white/20 text-slate-800 dark:text-white backdrop-blur-md transition-all active:scale-95"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex gap-2">
                        <button className="p-3 rounded-full hover:bg-white/20 text-slate-800 dark:text-white backdrop-blur-md transition-all active:scale-95">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3 mb-6"
                >
                    <div
                        className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20 mb-4"
                        style={{ backgroundColor: themeColor, color: 'white' }}
                    >
                        {leaderboard.metadata?.icon || <Trophy size={40} />}
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                        {leaderboard.title}
                    </h1>

                    {leaderboard.description && (
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm font-medium">
                            {leaderboard.description}
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">
                        <span>{stats.candidateCount} Candidates</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>{stats.totalVotes} Votes Cast</span>
                    </div>
                </motion.div>

                {/* Glassmorphic Tabs */}
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-xl p-1.5 rounded-2xl flex relative shadow-sm max-w-md mx-auto">
                    {/* Animated Active Indicator */}
                    <motion.div
                        className="absolute top-1.5 bottom-1.5 rounded-xl bg-white dark:bg-[#2E3238] shadow-sm z-0"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        style={{
                            width: 'calc(50% - 6px)',
                            left: activeTab === 'rankings' ? '6px' : 'calc(50% + 0px)'
                        }}
                    />

                    <button
                        onClick={() => setActiveTab('rankings')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 relative z-10 transition-colors
                        ${activeTab === 'rankings'
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700'}`}
                    >
                        <Trophy size={18} className={activeTab === 'rankings' ? 'text-yellow-500' : ''} />
                        Rankings
                    </button>
                    <button
                        onClick={() => setActiveTab('vote')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 relative z-10 transition-colors
                        ${activeTab === 'vote'
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700'}`}
                    >
                        <Swords size={18} className={activeTab === 'vote' ? 'text-indigo-500' : ''} />
                        Face-Off
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-[#151618] rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-20 mt-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'vote' ? (
                        <motion.div
                            key="vote"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <LeaderboardVote leaderboard={leaderboard} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="rankings"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <LeaderboardRankingsList leaderboard={leaderboard} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

