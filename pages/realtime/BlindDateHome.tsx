import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart, Play, ArrowLeft } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { supabase } from '../../store/supabaseClient';
import { CarvedButton } from '../../components/CarvedButton';

interface Props {
    onStartMatching: () => void;
    onBack: () => void;
}

export const BlindDateHome: React.FC<Props> = ({ onStartMatching, onBack }) => {
    const { currentUser } = useApp();

    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState('18:00');
    const [endTime, setEndTime] = useState('22:00');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPreferences();
    }, [currentUser]);

    const fetchPreferences = async () => {
        if (!currentUser) return;
        const { data, error } = await supabase
            .from('blind_date_preferences')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();

        if (data) {
            setIsActive(data.is_active);
            setStartTime(data.preferred_start_time || '18:00');
            setEndTime(data.preferred_end_time || '22:00');
        }
        setLoading(false);
    };

    const savePreferences = async () => {
        setLoading(true);
        const updates = {
            user_id: currentUser.id,
            is_active: isActive,
            preferred_start_time: startTime,
            preferred_end_time: endTime,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('blind_date_preferences')
            .upsert(updates);

        if (error) {
            console.error('Error saving preferences:', error);
        }
        setLoading(false);
    };

    const handleStartMatching = async () => {
        if (!isActive) {
            setIsActive(true);
            // Save state as active before entering
            await supabase.from('blind_date_preferences').upsert({
                user_id: currentUser.id,
                is_active: true,
                preferred_start_time: startTime,
                preferred_end_time: endTime,
                updated_at: new Date().toISOString(),
            });
        }
        onStartMatching();
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-obsidian-base p-6 flex items-center justify-center relative">
            <div className="absolute top-8 left-8 z-20">
                <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full">
                    <ArrowLeft size={24} className="text-slate-400" />
                </CarvedButton>
            </div>

            <div className="max-w-md w-full bg-obsidian-surface rounded-3xl p-8 neu-convex shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="text-center mb-10 relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 text-pink-500 mb-4 animate-pulse-slow">
                        <Heart className="w-8 h-8 fill-current" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                        Blind Dates
                    </h1>
                    <p className="text-slate-400 mt-2">Connect randomly with new people.</p>
                </div>

                <div className="space-y-6 relative z-10">
                    {/* Time Preferences */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            Preferred Time Range
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="flex-1 bg-obsidian-deep border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 [color-scheme:dark]"
                            />
                            <span className="text-slate-500">-</span>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="flex-1 bg-obsidian-deep border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Active Toggle (Optional UI, can be implicit in Start) */}
                    <div className="flex items-center justify-between p-4 bg-obsidian-deep rounded-xl border border-white/5">
                        <span className="text-slate-300">Ready to participate?</span>
                        <div
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isActive ? 'bg-green-500' : 'bg-slate-700'}`}
                            onClick={() => setIsActive(!isActive)}
                        >
                            <motion.div
                                className="w-4 h-4 rounded-full bg-white shadow-sm"
                                animate={{ x: isActive ? 24 : 0 }}
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <CarvedButton
                        onClick={handleStartMatching}
                        className="w-full !rounded-2xl !py-4 text-lg font-bold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white hover:from-pink-500 hover:to-purple-500 transition-all duration-300 group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Start Matching
                            <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" />
                        </span>
                    </CarvedButton>
                </div>
            </div>
        </div>
    );
};
