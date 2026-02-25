
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, RefreshCw, AlertTriangle, Wrench, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ChatMessage } from '../../types';
import { AgentAction } from '../../src/ai/agentActions';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';
import { motion } from 'framer-motion';

interface Props {
    messages: ChatMessage[];
    onSendMessage: (message: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    activeContext?: { type: 'page' | 'post' | 'selection'; content: string; id?: string } | null;
    pendingActions?: AgentAction[];
    toolInProgress?: string | null;
}

const ACTION_STATUS_ICONS: Record<string, React.ReactNode> = {
    proposed: <Clock size={14} className="text-amber-500" />,
    approved: <CheckCircle size={14} className="text-blue-500" />,
    executing: <RefreshCw size={14} className="text-blue-500 animate-spin" />,
    executed: <CheckCircle size={14} className="text-emerald-500" />,
    denied: <XCircle size={14} className="text-red-500" />,
    failed: <XCircle size={14} className="text-red-500" />,
};

const ACTION_STATUS_LABELS: Record<string, string> = {
    proposed: 'Waiting for approval',
    approved: 'Approved',
    executing: 'Executing...',
    executed: 'Completed',
    denied: 'Denied',
    failed: 'Failed',
};

export const ChatWindow: React.FC<Props> = ({ messages, onSendMessage, isLoading, error, activeContext, pendingActions = [], toolInProgress }) => {
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useApp();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, pendingActions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const msg = input;
        setInput('');
        await onSendMessage(msg);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#1E2024] rounded-2xl overflow-hidden relative">

            {/* Context Banner */}
            {activeContext && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800 p-2 px-4 flex items-center gap-2 shadow-sm backdrop-blur-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                        <span className="text-xs">📎</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                            Attached: {activeContext.type}
                        </p>
                        {activeContext.type === 'post' && (
                            <p className="text-[10px] text-indigo-700 dark:text-indigo-300 truncate opacity-80">
                                {activeContext.content.split('\n')[1]?.replace('Title: ', '') || 'Current Post'}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${activeContext ? 'pt-14' : ''}`}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-70">
                        <Bot size={48} className="mb-2 text-emerald-500" />
                        <p className="font-medium text-lg">Ask STC Bot anything!</p>
                        <p className="text-sm text-center">"Show me latest stories" or "Post a story for me"</p>
                        {activeContext && (
                            <div className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <p className="text-xs text-indigo-600 dark:text-indigo-300">
                                    I have read the attached {activeContext.type}. Ask me about it!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
              ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                            {msg.role === 'user' ? (
                                currentUser.avatar ? <img src={currentUser.avatar} alt="User" className="w-full h-full rounded-full object-cover" /> : <User size={16} className="text-slate-500 dark:text-slate-300" />
                            ) : (
                                <Bot size={16} className="text-white" />
                            )}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user'
                                ? 'bg-emerald-500 text-white rounded-tr-none'
                                : 'bg-white dark:bg-[#2A2D35] text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                            {msg.role === 'user' ? (
                                msg.content
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Tool in Progress Indicator */}
                {toolInProgress && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-white dark:bg-[#2A2D35] rounded-2xl rounded-tl-none p-3 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Wrench size={14} className="text-indigo-500 animate-pulse" />
                                <span className="font-medium">{toolInProgress}</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Pending Agent Actions */}
                {pendingActions.map((action) => (
                    <motion.div
                        key={action.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                            <Wrench size={14} className="text-white" />
                        </div>
                        <div className="max-w-[80%] rounded-2xl rounded-tl-none p-3 shadow-sm border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10">
                            <div className="flex items-center gap-2 mb-1">
                                {ACTION_STATUS_ICONS[action.status]}
                                <span className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                                    {ACTION_STATUS_LABELS[action.status]}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {action.label}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                {action.description}
                            </p>
                            {action.result && (
                                <div className={`mt-2 text-xs px-2 py-1 rounded-lg ${action.result.success
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                    }`}>
                                    {action.result.message}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {isLoading && !toolInProgress && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-white dark:bg-[#2A2D35] rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mx-auto w-fit">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#25282E]">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isLoading}
                        className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-[#191B1F] rounded-xl outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 rounded-lg bg-emerald-500 text-white disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors hover:bg-emerald-600"
                    >
                        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </form>
        </div>
    );
};
