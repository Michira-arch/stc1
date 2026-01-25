import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Keyboard, Plus, Heart, Play } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { useApp } from '../../store/AppContext';
import { supabase } from '../../store/supabaseClient';

interface Props {
    onJoinRoom: (roomId: string) => void;
    onNavigateToBlindDate?: () => void;
}

export const MeetHome: React.FC<Props> = ({ onJoinRoom, onNavigateToBlindDate }) => {
    const { currentUser, showToast } = useApp();
    const [roomIdInput, setRoomIdInput] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const createNewMeeting = async () => {
        setIsCreating(true);
        // 1. Create room in DB (optional, but good for tracking)
        const { data, error } = await supabase
            .from('rooms')
            .insert({ created_by: currentUser.id !== 'guest' ? currentUser.id : null })
            .select()
            .single();

        if (data) {
            onJoinRoom(data.id);
        } else {
            // Fallback if DB fails or offline (use random UUID locally)
            // For now, let's just use a random string if DB fails to keep it resilient
            const randomId = crypto.randomUUID();
            onJoinRoom(randomId);
        }
        setIsCreating(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="p-6 rounded-full bg-accent/10 text-accent mb-4 neu-convex">
                        <Video size={48} />
                    </div>
                    <h1 className="text-4xl font-light text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                        Video Meetings
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        Connect with your team in real-time. Secure, high-quality video and audio calling.
                    </p>
                </div>

                {/* Blind Date Banner */}
                {onNavigateToBlindDate && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full p-6 rounded-3xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 relative overflow-hidden cursor-pointer"
                        onClick={onNavigateToBlindDate}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex items-center justify-between text-left">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Heart className="text-pink-400 fill-pink-400/20" size={20} />
                                    <span className="font-bold text-pink-200">Blind Date</span>
                                </div>
                                <p className="text-sm text-pink-100/70 max-w-[200px]">
                                    Meet someone new randomly. Spontaneous & fun.
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center pointer-events-none">
                                <Play size={20} className="text-pink-400 fill-current ml-1" />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="space-y-4">
                    <CarvedButton
                        onClick={createNewMeeting}
                        className="w-full !py-4 text-lg font-medium text-accent"
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Plus size={20} />
                            <span>New Meeting</span>
                        </div>
                    </CarvedButton>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Keyboard size={20} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Enter a code or link"
                            value={roomIdInput}
                            onChange={(e) => setRoomIdInput(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-transparent 
                         neu-concave text-slate-700 dark:text-slate-200 
                         focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                        />
                    </div>

                    <CarvedButton
                        onClick={() => roomIdInput && onJoinRoom(roomIdInput)}
                        disabled={!roomIdInput}
                        className={`w-full !py-4 text-slate-600 dark:text-slate-300 ${!roomIdInput ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Join
                    </CarvedButton>
                </div>
            </motion.div>
        </div>
    );
};
