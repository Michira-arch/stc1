import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Smile, Meh, Frown } from 'lucide-react';
import { CarvedButton } from './CarvedButton';
import { useApp } from '../store/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [rating, setRating] = useState<'good' | 'neutral' | 'bad' | null>(null);
  const [text, setText] = useState('');

  const handleSubmit = () => {
    // In a real app, send to backend
    showToast("Thanks for your feedback!", "success");
    setRating(null);
    setText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-ceramic-base dark:bg-obsidian-base p-6 rounded-[2rem]
                   shadow-[10px_10px_30px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Enjoying the app?</h3>
              <p className="text-xs text-slate-500 mt-1">Help us carve a better experience.</p>
          </div>
          <CarvedButton onClick={onClose} className="!w-8 !h-8 !rounded-full">
            <X size={14} />
          </CarvedButton>
        </div>

        {/* Rating */}
        <div className="flex justify-between gap-2 mb-6">
            <CarvedButton 
                active={rating === 'bad'} 
                onClick={() => setRating('bad')}
                className="flex-1 py-3 !rounded-2xl"
            >
                <Frown size={24} className={rating === 'bad' ? 'text-red-500' : 'text-slate-400'} />
            </CarvedButton>
            <CarvedButton 
                active={rating === 'neutral'} 
                onClick={() => setRating('neutral')}
                className="flex-1 py-3 !rounded-2xl"
            >
                <Meh size={24} className={rating === 'neutral' ? 'text-yellow-500' : 'text-slate-400'} />
            </CarvedButton>
            <CarvedButton 
                active={rating === 'good'} 
                onClick={() => setRating('good')}
                className="flex-1 py-3 !rounded-2xl"
            >
                <Smile size={24} className={rating === 'good' ? 'text-emerald-500' : 'text-slate-400'} />
            </CarvedButton>
        </div>

        {/* Text Area */}
        <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tell us what you think..."
            className="w-full h-24 bg-ceramic-surface dark:bg-obsidian-surface rounded-xl p-3 
                       text-sm outline-none text-slate-700 dark:text-slate-200 resize-none mb-6
                       neu-concave placeholder-slate-400/50"
        />

        {/* Submit */}
        <CarvedButton 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={!rating}
            className="w-full py-3 !rounded-xl"
        >
            <Send size={16} />
            <span>Send Feedback</span>
        </CarvedButton>

      </motion.div>
    </div>
  );
};