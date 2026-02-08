import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../store/supabaseClient';
import { Check, X, User, Heart, ThumbsUp, Shuffle, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import confetti from 'canvas-confetti';

interface Props {
    leaderboard: any;
}

export const LeaderboardVote: React.FC<Props> = ({ leaderboard }) => {
    const [entities, setEntities] = useState<any[]>([]);
    const [pair, setPair] = useState<[any, any] | null>(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [votedPairs, setVotedPairs] = useState<Set<string>>(new Set());
    const [allCaughtUp, setAllCaughtUp] = useState(false);
    const { showToast, currentUser } = useApp();

    useEffect(() => {
        loadData();
    }, [leaderboard.id, currentUser?.id]);

    const loadData = async () => {
        setLoading(true);
        setAllCaughtUp(false);
        const [entitiesData, votesData] = await Promise.all([
            fetchEntities(),
            fetchUserVotes()
        ]);

        if (entitiesData) {
            setEntities(entitiesData);

            // Reconstruct voted pairs set
            const votedSet = new Set<string>();
            if (votesData) {
                votesData.forEach((vote: any) => {
                    const sortedIds = [vote.winner_id, vote.loser_id].sort().join('-');
                    votedSet.add(sortedIds);
                });
            }
            setVotedPairs(votedSet);

            // Pick first pair
            pickRandomPair(entitiesData, votedSet);
        }
        setLoading(false);
    };

    const fetchEntities = async () => {
        const { data } = await supabase
            .from('ranked_entities')
            .select('*')
            .eq('leaderboard_id', leaderboard.id);
        return data;
    };

    const fetchUserVotes = async () => {
        if (!currentUser) return [];
        const { data } = await supabase
            .from('ranking_votes')
            .select('winner_id, loser_id')
            .eq('leaderboard_id', leaderboard.id)
            .eq('user_id', currentUser.id);
        return data;
    };

    const pickRandomPair = (pool: any[], currentVotedPairs: Set<string>) => {
        if (pool.length < 2) return;

        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop
        let p1, p2, key;

        do {
            let idx1 = Math.floor(Math.random() * pool.length);
            let idx2 = Math.floor(Math.random() * pool.length);
            while (idx1 === idx2) {
                idx2 = Math.floor(Math.random() * pool.length);
            }
            p1 = pool[idx1];
            p2 = pool[idx2];
            key = [p1.id, p2.id].sort().join('-');
            attempts++;
        } while (currentVotedPairs.has(key) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            setAllCaughtUp(true);
            setPair(null);
        } else {
            setPair([p1, p2]);
        }
    };

    const handleVote = async (winnerIndex: 0 | 1 | 'tie') => {
        if (!pair || voting) return;
        setVoting(true);

        // Haptic feedback
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }

        const left = pair[0];
        const right = pair[1];

        // Optimistic update: Add to local voted set immediately
        const pairKey = [left.id, right.id].sort().join('-');
        const newVotedSet = new Set(votedPairs);
        newVotedSet.add(pairKey);
        setVotedPairs(newVotedSet);

        try {
            let error;
            if (winnerIndex === 'tie') {
                const { error: err } = await supabase.rpc('submit_vote', {
                    match_leaderboard_id: leaderboard.id,
                    match_winner_id: left.id,
                    match_loser_id: right.id,
                    match_is_draw: true
                });
                error = err;
            } else {
                const winner = winnerIndex === 0 ? left : right;
                const loser = winnerIndex === 0 ? right : left;

                // Explode confetti on vote!
                const side = winnerIndex === 0 ? 0.25 : 0.75;
                confetti({
                    particleCount: 60,
                    spread: 60,
                    origin: { x: side, y: 0.7 },
                    colors: [leaderboard.metadata?.theme_color || '#F59E0B', '#ffffff']
                });

                const { error: err } = await supabase.rpc('submit_vote', {
                    match_leaderboard_id: leaderboard.id,
                    match_winner_id: winner.id,
                    match_loser_id: loser.id,
                    match_is_draw: false
                });
                error = err;
            }

            if (error) throw error;

            // Artificial delay for animation feel
            setTimeout(() => {
                pickRandomPair(entities, newVotedSet);
                setVoting(false);
            }, 400);

        } catch (err: any) {
            console.error('Vote failed:', err);
            showToast('Vote failed to submit', 'error');
            setVoting(false);
            // Revert optimistic update? For now assume it's fine, user can refresh if needed.
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Finding Match...</p>
        </div>
    );

    if (entities.length < 2) return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-slate-500">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Not Enough Candidates</h3>
            <p className="max-w-xs mx-auto text-sm mb-6">Need at least 2 candidates to start a face-off. Add them in the Rankings tab!</p>
        </div>
    );

    if (allCaughtUp) return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-slate-500">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                <Check size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">You're All Caught Up!</h3>
            <p className="max-w-xs mx-auto text-sm mb-6">You've voted on enough random pairs for now. Check out the rankings to see who's winning!</p>
        </div>
    );

    if (!pair) return null;

    return (
        <div className="flex flex-col h-full items-center px-4 pt-10 pb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-6 w-full max-w-2xl mb-8 relative">

                {/* Left Card */}
                <VoteCard
                    entity={pair[0]}
                    onClick={() => handleVote(0)}
                    disabled={voting}
                    side="left"
                    isVoting={voting}
                />

                {/* VS Badge */}
                <div className="flex flex-col items-center gap-4 z-10 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-[#25282e] shadow-xl flex items-center justify-center font-black text-slate-300 dark:text-slate-500 text-lg border-4 border-slate-50 dark:border-[#1A1D21]">
                        VS
                    </div>
                </div>

                {/* Right Card */}
                <VoteCard
                    entity={pair[1]}
                    onClick={() => handleVote(1)}
                    disabled={voting}
                    side="right"
                    isVoting={voting}
                />
            </div>

            {/* Tie Button */}
            <button
                onClick={() => handleVote('tie')}
                disabled={voting}
                className="group flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
            >
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                    <Shuffle size={20} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skip / Tie</span>
            </button>
        </div>
    );
};

const VoteCard = ({ entity, onClick, disabled, side, isVoting }: { entity: any, onClick: () => void, disabled: boolean, side: 'left' | 'right', isVoting: boolean }) => {
    return (
        <motion.div
            key={entity.id} // Important for presence animation
            initial={{ opacity: 0, x: side === 'left' ? -50 : 50, rotate: side === 'left' ? -5 : 5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            className={`flex-1 aspect-[3/4] max-w-[200px] rounded-[32px] p-2 flex flex-col relative cursor-pointer group
            ${disabled ? 'pointer-events-none' : ''}`}
            onClick={!disabled ? onClick : undefined}
            whileHover={{ scale: 1.02, rotate: side === 'left' ? -2 : 2 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Card Content */}
            <div className="absolute inset-0 bg-white dark:bg-[#25282e] rounded-[32px] shadow-2xl shadow-indigo-500/10 dark:shadow-none border border-white/50 dark:border-slate-700" />

            {/* Image Container */}
            <div className="relative flex-1 rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 m-2">
                {entity.image_url ? (
                    <img src={entity.image_url} alt={entity.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User size={64} />
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t opacity-0 group-hover:opacity-40 transition-opacity
                ${side === 'left' ? 'from-indigo-600' : 'from-rose-600'} to-transparent`} />
            </div>

            <div className="relative p-2 text-center pb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 text-base sm:text-lg">{entity.name}</h3>
                {entity.metadata?.department && (
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide opacity-80">{entity.metadata.department}</p>
                )}
            </div>

            {/* Selection Ring */}
            <div className={`absolute inset-0 -m-1 rounded-[36px] border-4 opacity-0 transition-opacity pointer-events-none
                ${side === 'left' ? 'border-indigo-500' : 'border-rose-500'}
                ${isVoting ? 'opacity-0' : 'group-hover:opacity-100'}`}
            />
        </motion.div>
    );
};
