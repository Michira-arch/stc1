
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, History, Plus, Shield } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { ActionConfirmationModal } from './ActionConfirmationModal';
import { ChatMessage } from '../../types';
import { getConversations, saveConversation, getConversation } from '../../src/services/chatStorage';

import { useApp } from '../../store/AppContext';
import { usePageContext } from '../../src/hooks/usePageContext';
import { sendMessageToAI, confirmAgentAction, AIContext } from '../../src/services/aiService';
import { AgentAction, createAgentAction, executeAgentAction, denyAgentAction, getToolCategory, isReadOnlyTool, ProposedAction } from '../../src/ai/agentActions';
import { trustManager } from '../../src/ai/trustManager';

interface Conversation {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: number;
    messages: ChatMessage[];
}

export const ChatModal: React.FC = () => {
    const { isChatOpen, closeChat, chatContext, currentUser } = useApp();
    const { getPageContext } = usePageContext();

    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [history, setHistory] = useState<Conversation[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toolInProgress, setToolInProgress] = useState<string | null>(null);

    // Agent action state
    const [pendingActions, setPendingActions] = useState<AgentAction[]>([]);
    const [actionToConfirm, setActionToConfirm] = useState<AgentAction | null>(null);

    // Load history on open
    useEffect(() => {
        if (isChatOpen) {
            loadHistory();
        }
    }, [isChatOpen]);

    const loadHistory = async () => {
        const convs = await getConversations();
        setHistory(convs.sort((a, b) => b.timestamp - a.timestamp));
    };

    const startNewChat = () => {
        setActiveConversationId(crypto.randomUUID());
        setMessages([]);
        setPendingActions([]);
        setShowHistory(false);
        setError(null);
        setToolInProgress(null);
    };

    const loadConversation = async (id: string) => {
        const conv = await getConversation(id);
        if (conv) {
            setMessages(conv.messages);
            setActiveConversationId(conv.id);
            setShowHistory(false);
            setPendingActions([]);
        }
    };

    // Auto-start new chat if none active or if context changes
    useEffect(() => {
        if (isChatOpen) {
            if (chatContext || (!activeConversationId && messages.length === 0)) {
                startNewChat();
            }
        }
    }, [isChatOpen, chatContext]);

    const handleSendMessage = async (text: string) => {
        const newMsg: ChatMessage = { role: 'user', content: text };
        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        setIsLoading(true);
        setError(null);

        // Add placeholder bot message
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const context: AIContext = chatContext ?
                { ...chatContext } :
                { type: 'page', content: getPageContext() };

            let botContent = '';

            await sendMessageToAI(updatedMessages, context, (chunk) => {
                botContent += chunk;
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last.role === 'assistant') {
                        return [...prev.slice(0, -1), { ...last, content: botContent }];
                    }
                    return prev;
                });
            });

            // Check for frontend actions in the response (navigation, theme, etc.)
            handleFrontendActions(botContent);

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
                loadHistory();
            }

        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
            setToolInProgress(null);
        }
    };

    /**
     * Detect and handle frontend-only actions embedded in AI responses.
     * These come from tools like navigate_to_page and update_theme.
     */
    const handleFrontendActions = (content: string) => {
        // The backend returns JSON-like results for frontend actions
        // We check for specific patterns in the response
        try {
            // Check for navigation instructions
            const navMatch = content.match(/navigate_to_page|Navigating to (\w+)/i);
            if (navMatch) {
                // Navigation will be handled via the action confirmation flow
                // if the user trusts navigation actions
            }
        } catch {
            // Not a structured response, just normal text
        }
    };

    /**
     * Handle action approval from the confirmation modal.
     */
    const handleApproveAction = async (action: AgentAction, alwaysTrust: boolean) => {
        setActionToConfirm(null);

        // Update trust if checkbox was checked
        if (alwaysTrust) {
            await trustManager.updateTrust(action.category, 'auto');
        }

        // Update action status
        const updatedAction = { ...action, status: 'executing' as const };
        setPendingActions(prev =>
            prev.map(a => a.id === action.id ? updatedAction : a)
        );

        try {
            // Execute via backend confirmation endpoint
            let resultContent = '';
            await confirmAgentAction(
                action.toolName,
                action.id,
                action.params,
                (chunk) => {
                    resultContent += chunk;
                }
            );

            // Update action as executed
            setPendingActions(prev =>
                prev.map(a => a.id === action.id ? {
                    ...a,
                    status: 'executed' as const,
                    result: { success: true, message: resultContent }
                } : a)
            );

            // Add result to chat
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: resultContent
            }]);

        } catch (err: any) {
            setPendingActions(prev =>
                prev.map(a => a.id === action.id ? {
                    ...a,
                    status: 'failed' as const,
                    result: { success: false, message: err.message }
                } : a)
            );
        }
    };

    /**
     * Handle action denial from the confirmation modal.
     */
    const handleDenyAction = async (action: AgentAction) => {
        setActionToConfirm(null);

        setPendingActions(prev =>
            prev.map(a => a.id === action.id ? { ...a, status: 'denied' as const } : a)
        );

        if (currentUser.id !== 'guest') {
            await denyAgentAction(action, currentUser.id);
        }

        setMessages(prev => [...prev, {
            role: 'assistant',
            content: `⛔ Action "${action.label}" was denied. Is there anything else I can help with?`
        }]);
    };

    return (
        <AnimatePresence>
            {isChatOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={closeChat}
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
                                        {toolInProgress ? '🔧 Using tools...' : isLoading ? 'Thinking...' : 'Agent Online'}
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
                                <button onClick={closeChat} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
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
                                        activeContext={chatContext}
                                        pendingActions={pendingActions}
                                        toolInProgress={toolInProgress}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Action Confirmation Modal */}
                    <ActionConfirmationModal
                        action={actionToConfirm}
                        onApprove={handleApproveAction}
                        onDeny={handleDenyAction}
                    />
                </>
            )}
        </AnimatePresence>
    );
};
