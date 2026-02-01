import React from 'react';

// Common classes for Neumorphism
const lightShadow = 'shadow-[-6px_-6px_14px_rgba(255,255,255,0.7),6px_6px_14px_rgba(174,174,192,0.4)]';
const darkShadow = 'dark:shadow-[-5px_-5px_10px_rgba(255,255,255,0.05),5px_5px_15px_rgba(0,0,0,0.5)]';

const lightPressed = 'active:shadow-[inset_-6px_-6px_10px_rgba(255,255,255,0.7),inset_6px_6px_10px_rgba(174,174,192,0.2)]';
const darkPressed = 'dark:active:shadow-[inset_-5px_-5px_10px_rgba(255,255,255,0.05),inset_5px_5px_10px_rgba(0,0,0,0.5)]';

// Static inset for inputs/containers
const lightInset = 'shadow-[inset_6px_6px_10px_rgba(174,174,192,0.2),inset_-6px_-6px_10px_rgba(255,255,255,0.7)]';
const darkInset = 'dark:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.5),inset_-5px_-5px_10px_rgba(255,255,255,0.05)]';

interface NeuProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const NeuCard: React.FC<NeuProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-ceramic dark:bg-obsidian rounded-2xl ${lightShadow} ${darkShadow} ${className} transition-all duration-300`}
    >
      {children}
    </div>
  );
};

export const NeuButton: React.FC<NeuProps & { variant?: 'primary' | 'default', disabled?: boolean }> = ({ 
  children, 
  className = '', 
  onClick, 
  variant = 'default',
  disabled = false
}) => {
  const baseStyle = `px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 select-none`;
  const colorStyle = variant === 'primary' 
    ? 'text-emerald-600 dark:text-emerald-400' 
    : 'text-slate-600 dark:text-slate-300';
  
  const shadowStyle = disabled 
    ? 'opacity-50 cursor-not-allowed'
    : `${lightShadow} ${darkShadow} ${lightPressed} ${darkPressed} hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`;

  return (
    <button 
      onClick={disabled ? undefined : onClick}
      className={`${baseStyle} ${colorStyle} bg-ceramic dark:bg-obsidian ${shadowStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export const NeuInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input 
      {...props}
      className={`w-full bg-ceramic dark:bg-obsidian rounded-xl px-4 py-3 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 ${lightInset} ${darkInset} ${props.className || ''}`}
    />
  );
};

export const NeuTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  return (
    <textarea 
      {...props}
      className={`w-full bg-ceramic dark:bg-obsidian rounded-xl px-4 py-3 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 ${lightInset} ${darkInset} ${props.className || ''}`}
    />
  );
};

export const NeuBadge: React.FC<{ children: React.ReactNode, type?: 'success' | 'warning' | 'info' }> = ({ children, type = 'info' }) => {
    let colorClass = 'text-slate-500';
    if (type === 'success') colorClass = 'text-emerald-500';
    if (type === 'warning') colorClass = 'text-amber-500';
    if (type === 'info') colorClass = 'text-blue-500';

    return (
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ceramic dark:bg-obsidian ${lightShadow} ${darkShadow} ${colorClass}`}>
            {children}
        </div>
    )
}
