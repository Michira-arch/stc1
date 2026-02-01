import React from 'react';

// Common prop types
interface NeuProps {
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLElement>;
    active?: boolean;
}

export const NeuCard: React.FC<NeuProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`
        bg-ceramic-100 dark:bg-obsidian-900 
        rounded-2xl 
        shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.6)]
        dark:shadow-[6px_6px_12px_#141417,-6px_-6px_12px_#26282e]
        transition-all duration-300
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export const NeuButton: React.FC<NeuProps & { variant?: 'primary' | 'icon' | 'default', disabled?: boolean }> = ({
    children, className = '', onClick, variant = 'default', active = false, disabled = false
}) => {

    const baseStyles = `
    transition-all duration-200 ease-in-out font-semibold flex items-center justify-center select-none
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
  `;

    const shadowStyles = active
        ? `shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]
       dark:shadow-[inset_4px_4px_8px_#111214,inset_-4px_-4px_8px_#26282e]`
        : `shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]
       dark:shadow-[5px_5px_10px_#111214,-5px_-5px_10px_#26282e]
       hover:shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)]
       dark:hover:shadow-[7px_7px_14px_#111214,-7px_-7px_14px_#26282e]`;

    const variantStyles = {
        default: `bg-ceramic-100 dark:bg-obsidian-900 text-slate-700 dark:text-slate-300 rounded-xl px-6 py-3 ${shadowStyles}`,
        primary: `bg-ceramic-100 dark:bg-obsidian-900 text-emerald-500 dark:text-emerald-400 rounded-xl px-6 py-3 border-2 border-transparent hover:border-emerald-500/10 ${shadowStyles}`,
        icon: `bg-ceramic-100 dark:bg-obsidian-900 text-slate-600 dark:text-slate-300 rounded-full p-3 w-12 h-12 ${shadowStyles}`,
    };

    return (
        <button onClick={disabled ? undefined : onClick} className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
            {children}
        </button>
    );
};

export const NeuInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    return (
        <input
            {...props}
            className={`
        w-full bg-ceramic-100 dark:bg-obsidian-900 
        text-slate-700 dark:text-slate-200
        placeholder-slate-400 dark:placeholder-slate-500
        rounded-xl px-4 py-3 outline-none
        shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]
        dark:shadow-[inset_3px_3px_6px_#111214,inset_-3px_-3px_6px_#26282e]
        focus:ring-2 focus:ring-emerald-500/20 transition-all
        ${props.className}
      `}
        />
    );
};

export const NeuTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    return (
        <textarea
            {...props}
            className={`
        w-full bg-ceramic-100 dark:bg-obsidian-900 
        text-slate-700 dark:text-slate-200
        placeholder-slate-400 dark:placeholder-slate-500
        rounded-xl px-4 py-3 outline-none resize-none
        shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]
        dark:shadow-[inset_3px_3px_6px_#111214,inset_-3px_-3px_6px_#26282e]
        focus:ring-2 focus:ring-emerald-500/20 transition-all
        ${props.className}
      `}
        />
    );
};

export const NeuSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => {
    return (
        <div className="relative">
            <select
                {...props}
                className={`
                    w-full bg-ceramic-100 dark:bg-obsidian-900 
                    text-slate-700 dark:text-slate-200
                    rounded-xl px-4 py-3 outline-none appearance-none
                    shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]
                    dark:shadow-[inset_3px_3px_6px_#111214,inset_-3px_-3px_6px_#26282e]
                    focus:ring-2 focus:ring-emerald-500/20 transition-all
                    ${props.className}
                `}
            >
                {props.children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
        </div>
    );
};

export const NeuBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="
        px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase
        text-emerald-600 dark:text-emerald-400
        bg-ceramic-100 dark:bg-obsidian-900
        shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.7)]
        dark:shadow-[2px_2px_4px_#111214,-2px_-2px_4px_#26282e]
    ">
        {children}
    </div>
);
