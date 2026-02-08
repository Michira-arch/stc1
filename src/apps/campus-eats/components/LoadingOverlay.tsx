import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
    text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, text = 'Loading...' }) => {
    if (!isLoading) return null;

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-sm rounded-2xl animate-fade-in">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent border-t-emerald-500 border-l-emerald-500 shadow-lg"></div>
            <p className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-100 bg-white/80 dark:bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
                {text}
            </p>
        </div>
    );
};
