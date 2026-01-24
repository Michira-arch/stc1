
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { Check, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  const icons = {
    success: <Check size={16} />,
    error: <AlertTriangle size={16} />,
    info: <Info size={16} />
  };

  const colors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-xs pointer-events-none">
      <AnimatePresence mode='popLayout'>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-ceramic-base/90 dark:bg-obsidian-surface/90 backdrop-blur-md 
                       shadow-[5px_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.3)]
                       border border-white/20 rounded-2xl p-3 flex items-center gap-3 pointer-events-auto"
          >
            <div className={`p-2 rounded-full bg-ceramic-surface dark:bg-obsidian-base 
                             shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] ${colors[toast.type]}`}>
              {icons[toast.type]}
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex-1">
              {toast.message}
            </span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
