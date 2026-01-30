
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, History, Plus } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { ChatMessage, Conversation } from '../../types';
import { supabase } from '../../store/supabaseClient';
import { getConversations, saveConversation, getConversation } from '../../src/services/chatStorage';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ChatModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [history, setHistory] = useState<Conversation[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load history on open
    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    const loadHistory = async () => {
        const convs = await getConversations();
        // Sort descending
        setHistory(convs.sort((a, b) => b.timestamp - a.timestamp));
    };

    const startNewChat = () => {
        setActiveConversationId(uuidv4());
        setMessages([]);
        setShowHistory(false);
        setError(null);
    };

    const loadConversation = async (id: string) => {
        const conv = await getConversation(id);
        if (conv) {
            setMessages(conv.messages);
            setActiveConversationId(conv.id);
            setShowHistory(false);
        }
    };

    // Auto-start new chat if none active
    useEffect(() => {
        if (isOpen && !activeConversationId && messages.length === 0) {
            startNewChat();
        }
    }, [isOpen]);

    const handleSendMessage = async (text: string) => {
        const newMsg: ChatMessage = { role: 'user', content: text };
        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        setIsLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) throw new Error("Please log in to use AI chat.");

            const response = await fetch('https://njzdblwjpuogbjujrxrw.supabase.co/functions/v1/chat-with-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: updatedMessages
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to get response");
            }

            if (!response.body) throw new Error("No response body");

            // Handle Stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botContent = '';

            // Add placeholder bot message
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);

                // Basic stream parsing (assuming Groq sends standard SSE or raw text chunks here?)
                // Groq usually sends standard OpenAI format "data: {...}"
                // But our Edge Function just returns body?
                // Let's assume our Edge Function returns raw text content for simplicity since we blindly pipe body.
                // Wait, generatedResponse in llm.ts returns `callGroq` response.
                // Groq returns strict SSE. We need to parse it. 
                // OR we assume non-streaming for MVP simplicity in frontend if parsing is tough?
                // "stream: true" was set. 
                // Simple hacky parser for "data: json" lines

                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const json = JSON.parse(line.substring(6));
                            const content = json.choices[0]?.delta?.content || '';
                            botContent += content;

                            setMessages(prev => {
                                const last = prev[prev.length - 1];
                                if (last.role === 'assistant') {
                                    return [...prev.slice(0, -1), { ...last, content: botContent }];
                                }
                                return prev;
                            });
                        } catch (e) {
                            // ignore parse error of partial chunks
                        }
                    }
                }
            }

            // Save to IndexDB
            if (activeConversationId) {
                const finalMsgs = [...updatedMessages, { role: 'assistant', content: botContent } as ChatMessage];
                await saveConversation({
                    id: activeConversationId,
                    title: text.substring(0, 30) + '...',
                    lastMessage: botContent.substring(0, 50) + '...',
                    timestamp: Date.now(),
                    messages: finalMsgs
                });
                loadHistory(); // Refresh history list
            }

        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 top-12 z-[70] bg-white dark:bg-[#15171B] rounded-t-3xl shadow-2xl flex flex-col md:max-w-md md:mx-auto md:inset-x-auto md:w-full md:top-20 md:h-[80vh] md:rounded-3xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">AI</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">STC Assistant</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                        {isLoading ? 'Thinking...' : 'Online'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
                                    {showHistory ? <MessageSquare size={20} /> : <History size={20} />}
                                </button>
                                <button onClick={startNewChat} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-emerald-500">
                                    <Plus size={20} />
                                </button>
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative">
                            {showHistory ? (
                                <div className="h-full overflow-y-auto p-4 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Conversations</h4>
                                    {history.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No history yet.</p>}
                                    {history.map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => loadConversation(conv.id)}
                                            className="w-full text-left p-4 rounded-xl bg-slate-50 dark:bg-[#1E2024] hover:bg-slate-100 dark:hover:bg-[#25282E] transition-colors group"
                                        >
                                            <div className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1 truncate">{conv.title}</div>
                                            <div className="text-xs text-slate-500 truncate">{conv.lastMessage}</div>
                                            <div className="text-[10px] text-slate-400 mt-2 text-right">
                                                {new Date(conv.timestamp).toLocaleDateString()}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full p-2">
                                    <ChatWindow
                                        messages={messages}
                                        onSendMessage={handleSendMessage}
                                        isLoading={isLoading}
                                        error={error}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
