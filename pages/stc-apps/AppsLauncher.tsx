import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, ShoppingBag, Trophy, ArrowLeft, Utensils, Briefcase, GraduationCap } from 'lucide-react';
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
            gradient: 'from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40',
            textColor: 'text-blue-900 dark:text-blue-100',
            descColor: 'text-blue-700 dark:text-blue-300',
            iconBg: 'bg-white/60 dark:bg-blue-500/20',
            iconColor: 'text-blue-600 dark:text-blue-300',
            shadow: 'shadow-blue-500/10 dark:shadow-blue-900/20',
            comingSoon: true,
        },
        {
            id: 'food',
            name: 'Campus Eats',
            icon: <Utensils strokeWidth={2} size={28} />,
            description: 'Food & more',
            gradient: 'from-orange-100 to-red-200 dark:from-orange-900/40 dark:to-red-900/40',
            textColor: 'text-orange-900 dark:text-orange-100',
            descColor: 'text-orange-700 dark:text-orange-300',
            iconBg: 'bg-white/60 dark:bg-orange-500/20',
            iconColor: 'text-orange-600 dark:text-orange-300',
            shadow: 'shadow-orange-500/10 dark:shadow-orange-900/20',
        },
        {
            id: 'marketplace',
            name: 'Marketplace',
            icon: <ShoppingBag strokeWidth={2} size={28} />,
            description: 'Buy & sell',
            gradient: 'from-pink-100 to-rose-200 dark:from-pink-900/40 dark:to-rose-900/40',
            textColor: 'text-pink-900 dark:text-pink-100',
            descColor: 'text-pink-700 dark:text-pink-300',
            iconBg: 'bg-white/60 dark:bg-pink-500/20',
            iconColor: 'text-pink-600 dark:text-pink-300',
            shadow: 'shadow-pink-500/10 dark:shadow-pink-900/20',
        },
        {
            id: 'campus-hustle',
            name: 'Campus Hustle',
            icon: <Briefcase strokeWidth={2} size={28} />,
            description: 'Freelance & Gigs',
            gradient: 'from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/40',
            textColor: 'text-emerald-900 dark:text-emerald-100',
            descColor: 'text-emerald-700 dark:text-emerald-300',
            iconBg: 'bg-white/60 dark:bg-emerald-500/20',
            iconColor: 'text-emerald-600 dark:text-emerald-300',
            shadow: 'shadow-emerald-500/10 dark:shadow-emerald-900/20',
            comingSoon: true,
        },
        {
            id: 'lost-found',
            name: 'Lost & Found',
            icon: <Search strokeWidth={2} size={28} />,
            description: 'Find items',
            gradient: 'from-purple-100 to-violet-200 dark:from-purple-900/40 dark:to-violet-900/40',
            textColor: 'text-purple-900 dark:text-purple-100',
            descColor: 'text-purple-700 dark:text-purple-300',
            iconBg: 'bg-white/60 dark:bg-purple-500/20',
            iconColor: 'text-purple-600 dark:text-purple-300',
            shadow: 'shadow-purple-500/10 dark:shadow-purple-900/20',
            comingSoon: true,
        },

        {
            id: 'leaderboards',
            name: 'Leaderboards',
            icon: <Trophy strokeWidth={2} size={28} />,
            description: 'Campus rank',
            gradient: 'from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/40',
            textColor: 'text-amber-900 dark:text-amber-100',
            descColor: 'text-amber-700 dark:text-amber-300',
            iconBg: 'bg-white/60 dark:bg-amber-500/20',
            iconColor: 'text-amber-600 dark:text-amber-300',
            shadow: 'shadow-amber-500/10 dark:shadow-amber-900/20',
        },
        {
            id: 'unicampus',
            name: 'Unicampus',
            icon: <GraduationCap strokeWidth={2} size={28} />,
            description: 'Past Papers',
            gradient: 'from-teal-100 to-emerald-200 dark:from-teal-900/40 dark:to-emerald-900/40',
            textColor: 'text-teal-900 dark:text-teal-100',
            descColor: 'text-teal-700 dark:text-teal-300',
            iconBg: 'bg-white/60 dark:bg-teal-500/20',
            iconColor: 'text-teal-600 dark:text-teal-300',
            shadow: 'shadow-teal-500/10 dark:shadow-teal-900/20',
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
                        whileHover={app.comingSoon ? {} : { scale: 1.02, y: -2 }}
                        whileTap={app.comingSoon ? {} : { scale: 0.95 }}
                        onClick={() => !app.comingSoon && onNavigate(app.id)}
                        className={`
                            relative overflow-hidden rounded-[2rem] p-5
                            h-48 flex flex-col justify-between
                            bg-gradient-to-br ${app.gradient}
                            ${app.shadow} shadow-lg ring-1 ring-white/50 dark:ring-white/5
                            ${app.comingSoon ? 'opacity-70 cursor-default' : 'cursor-pointer'} group
                        `}
                    >
                        {/* Decorative Background Circles (Subtle) */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/40 dark:bg-white/5 blur-2xl group-hover:scale-110 transition-transform duration-500" />

                        {/* Coming Soon Badge */}
                        {app.comingSoon && (
                            <div className="absolute top-3 right-3 bg-white/80 dark:bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">Coming Soon</span>
                            </div>
                        )}

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
