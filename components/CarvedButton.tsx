import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { triggerHaptic } from '../utils';

interface Props extends HTMLMotionProps<"button"> {
  active?: boolean;
  variant?: 'primary' | 'default';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const CarvedButton: React.FC<Props> = ({ 
  children, 
  active, 
  className = "", 
  variant = 'default',
  onClick,
  icon,
  ...props 
}) => {
  
  // Base classes for structure
  const baseClasses = "relative rounded-xl transition-all duration-200 ease-out flex items-center justify-center gap-2 font-semibold tracking-wide";
  
  // Determine styles based on variant and active state
  let styleClasses = "";

  if (variant === 'primary') {
    // Primary Button (Emerald)
    if (active) {
       styleClasses = "bg-emerald-600 text-white shadow-inner";
    } else {
       styleClasses = "bg-emerald-500 text-white neu-convex shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]";
    }
  } else {
    // Default Button (Ceramic)
    const bgColors = "bg-ceramic-base dark:bg-obsidian-surface text-slate-600 dark:text-[#aab2bd]";
    if (active) {
        // Active state: Concave + Neon Glow
        styleClasses = `${bgColors} neu-concave text-emerald-500 dark:text-accent-glow dark:neu-glow-active`;
    } else {
        // Idle state: Convex
        styleClasses = `${bgColors} neu-convex hover:text-emerald-500 hover:scale-[1.02]`;
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        triggerHaptic('light');
        if(onClick) onClick(e);
      }}
      className={`${baseClasses} ${styleClasses} ${className}`}
      {...props}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children as React.ReactNode}
    </motion.button>
  );
};