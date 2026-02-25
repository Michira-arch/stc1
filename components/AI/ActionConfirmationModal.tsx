import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, Check, X, AlertTriangle, ChevronDown } from 'lucide-react';
import { AgentAction } from '../../src/ai/agentActions';
import { TrustCategory, TRUST_CATEGORIES, trustManager } from '../../src/ai/trustManager';

interface ActionConfirmationModalProps {
    action: AgentAction | null;
    onApprove: (action: AgentAction, alwaysTrust: boolean) => void;
    onDeny: (action: AgentAction) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    navigation: 'from-blue-500 to-sky-500',
    content_read: 'from-emerald-500 to-teal-500',
    content_write: 'from-orange-500 to-amber-500',
    social: 'from-pink-500 to-rose-500',
    profile: 'from-violet-500 to-purple-500',
    settings: 'from-slate-500 to-zinc-500',
};

export const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
    action,
    onApprove,
    onDeny,
}) => {
    const [alwaysTrust, setAlwaysTrust] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    if (!action) return null;

    const categoryMeta = TRUST_CATEGORIES.find(c => c.key === action.category);
    const gradient = CATEGORY_COLORS[action.category] || 'from-indigo-500 to-purple-500';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => onDeny(action)}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-white dark:bg-[#1E2024] rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10"
                >
                    {/* Gradient Header */}
                    <div className={`bg-gradient-to-r ${gradient} p-5 pb-4`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Shield size={22} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Action Requested</h3>
                                <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                                    {categoryMeta?.icon} {categoryMeta?.label || action.category}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                        {/* Action Description */}
                        <div className="bg-slate-50 dark:bg-[#25282E] rounded-2xl p-4">
                            <p className="font-semibold text-slate-800 dark:text-white mb-1">
                                {action.label}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {action.description}
                            </p>
                        </div>

                        {/* Parameters (Expandable) */}
                        {Object.keys(action.params).length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                >
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}
                                    />
                                    Details
                                </button>
                                <AnimatePresence>
                                    {showDetails && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-2 bg-slate-100 dark:bg-[#2A2D35] rounded-xl p-3 space-y-1">
                                                {Object.entries(action.params).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between text-sm">
                                                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                                                            {key}
                                                        </span>
                                                        <span className="text-slate-800 dark:text-slate-200 font-mono text-xs max-w-[200px] truncate">
                                                            {typeof value === 'string' ? value : JSON.stringify(value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Trust Toggle */}
                        <label
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setAlwaysTrust(!alwaysTrust)}
                        >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${alwaysTrust
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-400'
                                }`}>
                                {alwaysTrust && <Check size={12} className="text-white" />}
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Always allow {categoryMeta?.label?.toLowerCase()} actions
                                </span>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                    You can revoke this anytime in Settings
                                </p>
                            </div>
                            <ShieldCheck size={16} className={`transition-colors ${alwaysTrust ? 'text-emerald-500' : 'text-slate-400'}`} />
                        </label>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => onDeny(action)}
                                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-[#2A2D35] text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-[#32363E] transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <X size={16} />
                                Deny
                            </button>
                            <button
                                onClick={() => onApprove(action, alwaysTrust)}
                                className={`flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r ${gradient} text-white font-bold text-sm hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
                            >
                                <Check size={16} />
                                Approve
                            </button>
                        </div>
                    </div>

                    {/* Safety Notice */}
                    <div className="px-5 pb-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                            <AlertTriangle size={10} />
                            <span>Actions are logged for your security. Review in Settings → AI Actions.</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
