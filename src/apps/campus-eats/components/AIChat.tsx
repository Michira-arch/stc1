import React, { useState, useRef, useEffect } from 'react';
import { NeuButton, NeuInput, NeuCard } from './NeuComponents';
import { generateFoodRecommendation } from '../services/geminiService';
import { ChatMessage, Restaurant } from '../types';

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    restaurants: Restaurant[];
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, restaurants }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', text: 'Hey! I\'m your Campus Eats concierge. Hungry? Ask me for recommendations based on your budget or cravings! 🥑' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');

        // Add user message
        const newMessages = [...messages, { role: 'user', text: userMsg } as ChatMessage];
        setMessages(newMessages);
        setIsLoading(true);

        // Call Gemini with current restaurant data
        const responseText = await generateFoodRecommendation(
            userMsg,
            restaurants,
            newMessages
        );

        setIsLoading(false);
        setMessages([...newMessages, { role: 'assistant', text: responseText }]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <NeuCard className="w-full max-w-md h-[600px] flex flex-col overflow-hidden relative border-4 border-ceramic-100 dark:border-obsidian-900 shadow-2xl">

                {/* Header */}
                <div className="p-4 flex justify-between items-center z-10 bg-ceramic-100 dark:bg-obsidian-900 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">AI Concierge</h3>
                    </div>
                    <NeuButton variant="icon" onClick={onClose} className="w-8 h-8 !p-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </NeuButton>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-ceramic-200 dark:bg-obsidian-900/80">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed font-medium
                ${msg.role === 'user'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-br-none shadow-md border border-emerald-100 dark:border-emerald-800'
                                    : 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-bl-none shadow-sm border border-blue-100 dark:border-blue-800'
                                }
              `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-ceramic-100 dark:bg-obsidian-900 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-0"></div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-ceramic-100 dark:bg-obsidian-900 z-10">
                    <div className="flex gap-2">
                        <NeuInput
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Find vegan food under KES 1000..."
                        />
                        <NeuButton variant="primary" onClick={handleSend} disabled={isLoading || !input} className="!px-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </NeuButton>
                    </div>
                </div>

            </NeuCard>
        </div>
    );
};
