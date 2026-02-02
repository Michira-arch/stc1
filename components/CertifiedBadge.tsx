import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const CertifiedBadge: React.FC = () => {
    return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-200 via-white to-slate-300 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 border border-slate-300/50 dark:border-slate-500/50 shadow-[inset_0_1px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="relative flex items-center justify-center w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600"
            >
                <Check size={8} className="text-white" strokeWidth={3} />
            </motion.div>
            <span className="text-[9px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-200 dark:to-slate-400 tracking-wider uppercase">
                Certified
            </span>
        </div>
    );
};

export const LiquidMetalBorder: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => {
    return (
        <div className={`relative group ${className}`}>
            {/* Liquid Metal Effect */}
            <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-slate-300 via-white to-slate-300 dark:from-slate-600 dark:via-slate-400 dark:to-slate-700 animate-[spin_3s_linear_infinite] opacity-80 blur-[1px]"
                style={{ backgroundSize: '200% 200%' }} />

            {/* Secondary shine */}
            <div className="absolute inset-[-2px] rounded-full bg-gradient-to-bl from-transparent via-white/80 to-transparent dark:via-white/20 animate-pulse" />

            {/* Content Container */}
            <div className="relative rounded-full z-10 bg-slate-100 dark:bg-slate-900">
                {children}
            </div>
        </div>
    );
};
