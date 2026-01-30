import React from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';

interface MarketplaceProps {
    onBack: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-ceramic-base dark:bg-[#1A1D21] p-6 pt-12 flex flex-col">
            <header className="flex items-center gap-4 mb-8">
                <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full">
                    <ArrowLeft size={24} />
                </CarvedButton>
                <h1 className="text-2xl font-black text-slate-800 dark:text-white">Marketplace</h1>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-500">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Coming Soon</h2>
                <p className="text-slate-500 max-w-xs">Buy and sell textbooks, electronics, and more directly from other students.</p>

                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>
        </div>
    );
};
