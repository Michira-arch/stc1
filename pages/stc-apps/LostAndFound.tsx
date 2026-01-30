import React, { useState } from 'react';
import { ArrowLeft, Camera, User } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { useApp } from '../../store/AppContext';

interface LostAndFoundProps {
    onBack: () => void;
}

export const LostAndFound: React.FC<LostAndFoundProps> = ({ onBack }) => {
    const { showToast } = useApp();
    const [items, setItems] = useState([
        { id: 1, name: 'Blue Water Bottle', location: 'Library', date: '2 hrs ago', claimed: false },
        { id: 2, name: 'Calculus Textbook', location: 'Room 304', date: 'Yesterday', claimed: false },
    ]);

    const handleClaim = (id: number) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, claimed: true } : item));
        showToast('Claim request sent to finder!', 'success');
    };

    const handlePost = () => {
        showToast('Mock: Camera opened for uploads.', 'info');
    };

    return (
        <div className="min-h-screen bg-ceramic-base dark:bg-[#1A1D21] p-6 pt-12">
            <header className="flex items-center gap-4 mb-8">
                <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full">
                    <ArrowLeft size={24} />
                </CarvedButton>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Lost & Found</h1>
                    <p className="text-sm text-slate-500">Reconnect with items</p>
                </div>
                <CarvedButton onClick={handlePost} className="!w-12 !h-12 !rounded-full text-blue-500">
                    <Camera size={20} />
                </CarvedButton>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-[#2E3238] p-5 rounded-3xl shadow-[4px_4px_10px_#bebebe,-4px_-4px_10px_#ffffff] dark:shadow-[4px_4px_10px_#151618,-4px_-4px_10px_#35363e]">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{item.name}</h3>
                            <span className="text-xs text-slate-400">{item.date}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Found at: <span className="font-medium text-slate-700 dark:text-slate-300">{item.location}</span></p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <User size={14} className="text-slate-500" />
                                </div>
                                <span className="text-xs text-slate-500">Posted by Student</span>
                            </div>
                            <button
                                disabled={item.claimed}
                                onClick={() => handleClaim(item.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${item.claimed ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'}`}
                            >
                                {item.claimed ? 'Claimed' : 'Claim This'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
