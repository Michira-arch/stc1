import React from 'react';

interface NeumorphicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ 
  children, 
  active, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) => {
  // Base classes for both themes
  const base = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ease-out active:scale-95";
  
  // Light theme shadows
  const lightShadow = active 
    ? "shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]" 
    : "shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff]";

  // Dark theme shadows
  const darkShadow = active
    ? "dark:shadow-[inset_6px_6px_12px_#151519,inset_-6px_-6px_12px_#27272f]"
    : "dark:shadow-[6px_6px_12px_#151519,-6px_-6px_12px_#27272f] dark:hover:shadow-[8px_8px_16px_#151519,-8px_-8px_16px_#27272f]";

  // Color variants
  const colors = {
    primary: active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400",
    secondary: "text-slate-500 dark:text-slate-400",
    danger: "text-red-500 hover:text-red-600",
  };

  // Special case for "Filled" primary buttons (optional design choice, usually neumorphism relies on pressing, but sometimes we want color pops)
  // For this design, we keep buttons same color as bg but use text color and shadows to indicate state.

  return (
    <button 
      className={`${base} ${lightShadow} ${darkShadow} ${colors[variant]} bg-ceramic dark:bg-obsidian ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};
