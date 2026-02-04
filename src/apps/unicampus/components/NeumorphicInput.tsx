import React from 'react';

interface NeumorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="ml-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>}
      <input
        className={`
          w-full px-5 py-3 rounded-xl outline-none transition-all
          bg-ceramic dark:bg-obsidian
          text-slate-700 dark:text-slate-200
          placeholder-slate-400 dark:placeholder-slate-600
          shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff]
          dark:shadow-[inset_4px_4px_8px_#151519,inset_-4px_-4px_8px_#27272f]
          focus:shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]
          dark:focus:shadow-[inset_6px_6px_12px_#151519,inset_-6px_-6px_12px_#27272f]
          focus:ring-1 focus:ring-emerald-500/50
          ${className}
        `}
        {...props}
      />
    </div>
  );
};
