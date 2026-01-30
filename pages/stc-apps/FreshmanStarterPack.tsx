import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Map, Users, Shirt } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';

interface FreshmanStarterPackProps {
    onBack: () => void;
}

export const FreshmanStarterPack: React.FC<FreshmanStarterPackProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'nav' | 'norms' | 'fashion'>('nav');

    const content = {
        nav: {
            title: 'Campus Navigation',
            items: [
                { title: 'Main Gate', desc: 'Entry point for all students.' },
                { title: 'Library', desc: 'Open 24/7 for study sessions.' },
                { title: 'Cafeteria', desc: 'Food court and hangouts.' },
                { title: 'Admin Block', desc: 'Registrar and finance offices.' },
            ]
        },
        norms: {
            title: 'Campus Norms',
            items: [
                { title: 'Library', desc: 'No food or drinks allowed inside the library.' },
                { title: 'Quiet Zones', desc: 'Keep noise down near lecture halls.' },
                { title: 'ID Cards', desc: 'Wear your ID at all times.' },
            ]
        },
        fashion: {
            title: 'Fashion Guide',
            items: [
                { title: 'Casual Fridays', desc: 'Jeans and t-shirts allowed.' },
                { title: 'Formal Mondays', desc: 'Dress sharp for the week start.' },
                { title: 'Weather', desc: 'Carry an umbrella in June-July.' },
            ]
        }
    };

    return (
        <div className="min-h-screen bg-ceramic-base dark:bg-[#1A1D21] p-6 pt-12">
            <header className="flex items-center gap-4 mb-8">
                <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full">
                    <ArrowLeft size={24} />
                </CarvedButton>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Freshman Pack</h1>
                    <p className="text-sm text-slate-500">Your guide to campus life</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setActiveTab('nav')}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'nav' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white dark:bg-[#2E3238] text-slate-500'}`}
                >
                    <Map size={18} className="inline mr-2" /> Navigation
                </button>
                <button
                    onClick={() => setActiveTab('norms')}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'norms' ? 'bg-purple-500 text-white shadow-lg' : 'bg-white dark:bg-[#2E3238] text-slate-500'}`}
                >
                    <Users size={18} className="inline mr-2" /> Norms
                </button>
                <button
                    onClick={() => setActiveTab('fashion')}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'fashion' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white dark:bg-[#2E3238] text-slate-500'}`}
                >
                    <Shirt size={18} className="inline mr-2" /> Fashion
                </button>
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
            >
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">{content[activeTab].title}</h2>
                {content[activeTab].items.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#2E3238] p-5 rounded-3xl shadow-[4px_4px_10px_#bebebe,-4px_-4px_10px_#ffffff] dark:shadow-[4px_4px_10px_#151618,-4px_-4px_10px_#35363e]">
                        <h3 className="font-bold text-lg dark:text-white">{item.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
