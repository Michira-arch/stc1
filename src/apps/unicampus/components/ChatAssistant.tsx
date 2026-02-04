import React, { useState, useEffect, useRef } from 'react';
import { Paper, ChatMessage } from '../types';
import { sendMessageToAI, AIContext } from '../../../../src/services/aiService';
import { ChatMessage as SharedChatMessage } from '../../../../types';
import { Send, Bot, Sparkles, X } from 'lucide-react';
import { NeumorphicButton } from './NeumorphicButton';
import { NeumorphicInput } from './NeumorphicInput';

interface ChatAssistantProps {
  paper: Paper;
  onClose: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ paper, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Greeting & Context loading
    const initialGreeting: ChatMessage = {
      id: 'init',
      role: 'model',
      text: `Hello! I'm your Unicampus study buddy. I see you're looking at **${paper.title}** from **${paper.university}**. Would you like me to generate some revision questions?`,
      timestamp: Date.now(),
    };
    setMessages([initialGreeting]);
  }, [paper]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mapHistoryToShared = (msgs: ChatMessage[]): SharedChatMessage[] => {
    return msgs.map(m => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text
    } as SharedChatMessage));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare Placeholder
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: ChatMessage = {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, botMsg]);

    const history = mapHistoryToShared([...messages, userMsg]);

    const context: AIContext = {
      type: 'page',
      content: `Active Paper Context:\nTitle: ${paper.title}\nUniversity: ${paper.university}\nCourse Code: ${paper.courseCode}\nYear: ${paper.year}\nCategory: ${paper.category}`
    };

    let responseText = '';
    try {
      await sendMessageToAI(history, context, (chunk) => {
        responseText += chunk;
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: responseText } : m));
        scrollToBottom();
      });
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "Sorry, I'm having trouble connecting to the study server right now." } : m));
    }

    setLoading(false);
  };

  const handleGenerateQuestions = async () => {
    setLoading(true);

    // Add user message indicating the action (hidden or visible? Unicampus code didn't add user msg for this action, just bot response)
    // But sendMessageToAI needs a prompt.
    // We'll mimic the user asking for it.

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: "Generate revision questions for this paper.",
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    const botMsgId = (Date.now() + 1).toString();
    const botMsg: ChatMessage = {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, botMsg]);

    const history = mapHistoryToShared([...messages, userMsg]);
    const context: AIContext = {
      type: 'page',
      content: `Active Paper Context:\nTitle: ${paper.title}\nUniversity: ${paper.university}\nCourse Code: ${paper.courseCode}\nYear: ${paper.year}\nCategory: ${paper.category}`
    };

    // Specific instruction
    const promptOverride: SharedChatMessage = {
      role: 'system',
      content: `You are an expert academic tutor. Generate 3 specific, high-value revision questions likely to appear in the exam "${paper.title}" (${paper.courseCode}). Provide brief hints.`
    };
    // Append this instruction to history? Or just let the context handle it. 
    // The shared service appends context. 
    // We really want to send a specific prompt. 
    // The userMsg "Generate revision questions..." should be enough with the context provided.

    let responseText = '';
    try {
      await sendMessageToAI(history, context, (chunk) => {
        responseText += chunk;
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: responseText } : m));
        scrollToBottom();
      });
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "Unable to generate questions at the moment." } : m));
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-ceramic dark:bg-obsidian border-l border-transparent dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Bot size={24} />
          <h2 className="font-bold text-lg">Study Assistant</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-red-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user'
                ? 'bg-emerald-500 text-white rounded-tr-none shadow-md'
                : 'bg-ceramic dark:bg-[#222227] text-slate-700 dark:text-slate-200 rounded-tl-none shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#151519,-4px_-4px_8px_#27272f]'
              }
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && !messages.some(m => m.role === 'model' && m.text === '') && (
          <div className="flex justify-start">
            <div className="bg-ceramic dark:bg-[#222227] p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 italic animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (if empty-ish) */}
      {messages.length < 3 && (
        <div className="px-4 pb-2">
          <button
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="w-full py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 transition-colors"
          >
            <Sparkles size={14} /> Generate Quiz
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 pt-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <NeumorphicInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about this topic..."
              className="!py-3 !text-sm"
            />
          </div>
          <NeumorphicButton
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="!px-3 !py-0"
          >
            <Send size={18} />
          </NeumorphicButton>
        </div>
      </div>
    </div>
  );
};
