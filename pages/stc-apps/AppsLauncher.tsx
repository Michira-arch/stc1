import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, ShoppingBag, Trophy, ArrowLeft, Utensils, TriangleAlert } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';

interface AppsLauncherProps {
    onBack: () => void;
    onNavigate: (app: string) => void;
}

export const AppsLauncher: React.FC<AppsLauncherProps> = ({ onBack, onNavigate }) => {
    const apps = [
        {
            id: 'freshman',
            name: 'Freshman Pack',
            icon: <BookOpen strokeWidth={2} size={28} />,
            description: 'Campus guide',
            // Light: Pastel Blue, Dark: Deep Blue
            gradient: 'from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40',
            textColor: 'text-blue-900 dark:text-blue-100',
            descColor: 'text-blue-700 dark:text-blue-300',
            iconBg: 'bg-white/60 dark:bg-blue-500/20',
            iconColor: 'text-blue-600 dark:text-blue-300',
            shadow: 'shadow-blue-500/10 dark:shadow-blue-900/20'
        },
        {
            id: 'food',
            name: 'Campus Eats',
            icon: <Utensils strokeWidth={2} size={28} />,
            description: 'Food & more',
            // Light: Pastel Orange, Dark: Deep Orange
            gradient: 'from-orange-100 to-red-200 dark:from-orange-900/40 dark:to-red-900/40',
            textColor: 'text-orange-900 dark:text-orange-100',
            descColor: 'text-orange-700 dark:text-orange-300',
            iconBg: 'bg-white/60 dark:bg-orange-500/20',
            iconColor: 'text-orange-600 dark:text-orange-300',
            shadow: 'shadow-orange-500/10 dark:shadow-orange-900/20'
        },
        {
            id: 'lost-found',
            name: 'Lost & Found',
            icon: <Search strokeWidth={2} size={28} />,
            description: 'Find items',
            // Light: Pastel Purple, Dark: Deep Purple
            gradient: 'from-purple-100 to-violet-200 dark:from-purple-900/40 dark:to-violet-900/40',
            textColor: 'text-purple-900 dark:text-purple-100',
            descColor: 'text-purple-700 dark:text-purple-300',
            iconBg: 'bg-white/60 dark:bg-purple-500/20',
            iconColor: 'text-purple-600 dark:text-purple-300',
            shadow: 'shadow-purple-500/10 dark:shadow-purple-900/20'
        },
        {
            id: 'marketplace',
            name: 'Campus Hustle',
            icon: <ShoppingBag strokeWidth={2} size={28} />,
            description: 'Buy & sell',
            // Light: Pastel Emerald, Dark: Deep Emerald
            gradient: 'from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/40',
            textColor: 'text-emerald-900 dark:text-emerald-100',
            descColor: 'text-emerald-700 dark:text-emerald-300',
            iconBg: 'bg-white/60 dark:bg-emerald-500/20',
            iconColor: 'text-emerald-600 dark:text-emerald-300',
            shadow: 'shadow-emerald-500/10 dark:shadow-emerald-900/20'
        },
        {
            id: 'leaderboards',
            name: 'Leaderboards',
            icon: <Trophy strokeWidth={2} size={28} />,
            description: 'Campus rank',
            // Light: Pastel Amber, Dark: Deep Amber
            gradient: 'from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/40',
            textColor: 'text-amber-900 dark:text-amber-100',
            descColor: 'text-amber-700 dark:text-amber-300',
            iconBg: 'bg-white/60 dark:bg-amber-500/20',
            iconColor: 'text-amber-600 dark:text-amber-300',
            shadow: 'shadow-amber-500/10 dark:shadow-amber-900/20'
        },
    ];

    return (
        <div className="min-h-screen bg-ceramic-base dark:bg-[#1A1D21] p-6 pt-12">
            <header className="flex items-center gap-4 mb-8">
                <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full">
                    <ArrowLeft size={24} />
                </CarvedButton>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-none">STC APPS</h1>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Campus Hub</span>
                </div>
            </header>

            {/* Development Warning Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 flex items-start gap-3"
            >
                <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                    <TriangleAlert size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-0.5">Under Construction</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                        These apps are still in development, and may not work as intended yet.
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 pb-20">
                {apps.map((app, index) => (
                    <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigate(app.id)}
                        className={`
                            relative overflow-hidden rounded-[2rem] p-5
                            h-48 flex flex-col justify-between
                            bg-gradient-to-br ${app.gradient}
                            ${app.shadow} shadow-lg ring-1 ring-white/50 dark:ring-white/5
                            cursor-pointer group
                        `}
                    >
                        {/* Decorative Background Circles (Subtle) */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/40 dark:bg-white/5 blur-2xl group-hover:scale-110 transition-transform duration-500" />

                        {/* Icon Container */}
                        <div className="relative">
                            <div className={`w-12 h-12 rounded-2xl ${app.iconBg} backdrop-blur-md flex items-center justify-center ${app.iconColor} shadow-sm border border-white/20`}>
                                {app.icon}
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className={`relative z-10 ${app.textColor}`}>
                            <h3 className="font-bold text-lg leading-tight mb-1">{app.name}</h3>
                            <p className={`text-xs ${app.descColor} font-semibold line-clamp-2`}>{app.description}</p>
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
