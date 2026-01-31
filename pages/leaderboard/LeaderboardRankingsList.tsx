import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../store/supabaseClient';
import { Medal, User, Crown, Sparkles } from 'lucide-react';

interface Props {
    leaderboard: any;
}

export const LeaderboardRankingsList: React.FC<Props> = ({ leaderboard }) => {
    const [entities, setEntities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            const { data } = await supabase
                .from('ranked_entities')
                .select('*')
                .eq('leaderboard_id', leaderboard.id)
                // @ts-ignore
                .order('elo_score', { ascending: false })
                .limit(50);
            setEntities(data || []);
            setLoading(false);
        };
        fetchRankings();
    }, [leaderboard.id]);

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    // Admin/Debug: Allow adding entities if empty
    const seedEntity = async () => {
        const name = prompt("Name of candidate:");
        if (!name) return;
        await supabase.from('ranked_entities').insert({
            leaderboard_id: leaderboard.id,
            name,
            elo_score: 1200
        });
        window.location.reload(); // Quick refresh
    };

    if (entities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
                    <Sparkles size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Rankings Yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8">
                    Be the first to add a candidate to this leaderboard and start the competition!
                </p>
                <button
                    onClick={seedEntity}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                    Add Candidate
                </button>
            </div>
        );
    }

    const top3 = entities.slice(0, 3);
    const rest = entities.slice(3);

    return (
        <div className="pb-24">
            {/* Podium Section */}
            {top3.length > 0 && (
                <div className="flex items-end justify-center gap-2 sm:gap-4 px-4 pt-10 pb-12 mb-4 bg-gradient-to-b from-slate-50 to-white dark:from-[#1A1D21] dark:to-[#151618]">
                    {/* 2nd Place */}
                    {top3[1] && (
                        <PodiumItem entity={top3[1]} rank={2} color="text-slate-400" bgColor="bg-slate-100 dark:bg-slate-800" height="h-32" />
                    )}

                    {/* 1st Place */}
                    {top3[0] && (
                        <PodiumItem entity={top3[0]} rank={1} isFirst color="text-yellow-500" bgColor="bg-yellow-100 dark:bg-yellow-900/30" height="h-40" />
                    )}

                    {/* 3rd Place */}
                    {top3[2] && (
                        <PodiumItem entity={top3[2]} rank={3} color="text-amber-700" bgColor="bg-amber-100 dark:bg-amber-900/30" height="h-24" />
                    )}
                </div>
            )}

            {/* List Section */}
            <div className="px-4 space-y-3">
                {rest.map((entity, index) => (
                    <motion.div
                        key={entity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-[#1E2023] p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group
                        shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all"
                    >
                        {/* Rank Number */}
                        <div className="w-8 text-center font-bold text-slate-400 text-sm">
                            {index + 4}
                        </div>

                        {/* Avatar */}
                        <div className="relative">
                            {entity.image_url ? (
                                <img src={entity.image_url} alt={entity.name} className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <User size={18} />
                                </div>
                            )}
                        </div>

                        {/* Name & Dept */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm sm:text-base">{entity.name}</h3>
                            {entity.metadata?.department && (
                                <p className="text-xs text-slate-500 truncate">{entity.metadata.department}</p>
                            )}
                        </div>

                        {/* Score */}
                        <div className="text-right pl-2">
                            <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                {Math.round(entity.elo_score)}
                            </div>
                        </div>
                    </motion.div>
                ))}

                <div className="pt-8 text-center pb-8">
                    <button onClick={seedEntity} className="text-xs font-bold text-slate-400 hover:text-slate-600 py-3 px-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        + Suggest Another Candidate
                    </button>
                </div>
            </div>
        </div>
    );
};

const PodiumItem = ({ entity, rank, isFirst, color, bgColor, height }: any) => (
    <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: rank * 0.1 }}
        className={`flex flex-col items-center justify-end w-1/3 max-w-[120px]`}
    >
        <div className="relative mb-3">
            {entity.image_url ? (
                <img
                    src={entity.image_url}
                    alt={entity.name}
                    className={`rounded-full object-cover border-4 border-white dark:border-[#151618] shadow-lg
                    ${isFirst ? 'w-20 h-20' : 'w-16 h-16'}`}
                />
            ) : (
                <div className={`rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 border-4 border-white dark:border-[#151618] shadow-lg
                ${isFirst ? 'w-20 h-20' : 'w-16 h-16'}`}>
                    <User size={isFirst ? 32 : 24} />
                </div>
            )}
            <div className={`absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white dark:border-[#151618]
                ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                {rank}
            </div>
            {isFirst && <Crown size={24} className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500 rotate-[-10deg]" />}
        </div>

        <div className="text-center mb-2 px-1 w-full">
            <h3 className={`font-bold text-slate-800 dark:text-white truncate leading-tight ${isFirst ? 'text-sm' : 'text-xs'}`}>
                {entity.name}
            </h3>
            <p className={`font-mono font-bold ${color} text-[10px] sm:text-xs`}>
                {Math.round(entity.elo_score)}
            </p>
        </div>

        <div className={`w-full ${height} ${bgColor} rounded-t-2xl relative`}>
            {isFirst && (
                <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/40 skew-y-6 opacity-30" />
            )}
        </div>
    </motion.div>
);
