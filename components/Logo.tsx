import React from 'react';

export const Logo = ({ size = 32 }: { size?: number }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Bubble 1 (Bottom Left) */}
      <div 
        className="absolute bottom-0 left-0 w-[70%] h-[70%] bg-emerald-500 rounded-full rounded-tr-none z-10 
                   shadow-[2px_2px_5px_rgba(0,0,0,0.2)] dark:shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
      />
      
      {/* Bubble 2 (Top Right) */}
      <div 
        className="absolute top-0 right-0 w-[70%] h-[70%] bg-emerald-400 dark:bg-emerald-600 rounded-full rounded-bl-none opacity-90
                   shadow-[2px_2px_5px_rgba(0,0,0,0.2)]" 
      />
      
      {/* Overlap effect */}
      <div className="absolute top-[20%] right-[20%] w-[15%] h-[15%] bg-white/30 rounded-full blur-[1px]" />
    </div>
  );
};