
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../../types';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';
import { motion } from 'framer-motion';

interface Props {
    messages: ChatMessage[];
    onSendMessage: (message: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export const ChatWindow: React.FC<Props> = ({ messages, onSendMessage, isLoading, error }) => {
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useApp();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const msg = input;
        setInput('');
        await onSendMessage(msg);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#1E2024] rounded-2xl overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-70">
                        <Bot size={48} className="mb-2 text-emerald-500" />
                        <p className="font-medium text-lg">Ask STC Bot anything!</p>
                        <p className="text-sm">"How do I find food?" or "Where is the library?"</p>
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
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
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
