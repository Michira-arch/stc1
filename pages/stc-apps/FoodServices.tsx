import React from 'react';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import { useApp } from '../../store/AppContext';

interface FoodServicesProps {
    onBack: () => void;
}

export const FoodServices: React.FC<FoodServicesProps> = ({ onBack }) => {
    const { showToast } = useApp();

    const menu = [
        { id: 1, name: 'Spicy Chicken Wrap', price: 'Ksh 250', image: '🌯' },
        { id: 2, name: 'Vegan Burger', price: 'Ksh 450', image: '🍔' },
        { id: 3, name: 'Iced Latte', price: 'Ksh 200', image: '🥤' },
        { id: 4, name: 'Caesar Salad', price: 'Ksh 350', image: '🥗' },
    ];

    const handleOrder = (item: string) => {
        showToast(`Ordered ${item}! Go to counter for pickup.`, 'success');
    };

    return (
        <div className="min-h-screen bg-ceramic-base dark:bg-[#1A1D21] p-6 pt-12">
            <header className="flex items-center gap-4 mb-8">
                <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full">
                    <ArrowLeft size={24} />
                </CarvedButton>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Campus Eats</h1>
                    <p className="text-sm text-slate-500">Order for pickup</p>
                </div>
            </header>

            <div className="space-y-4">
                {menu.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-[#2E3238] p-4 rounded-3xl flex items-center justify-between shadow-[4px_4px_10px_#bebebe,-4px_-4px_10px_#ffffff] dark:shadow-[4px_4px_10px_#151618,-4px_-4px_10px_#35363e]">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{item.image}</span>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                                <p className="text-sm text-orange-500 font-bold">{item.price}</p>
                            </div>
                        </div>
                        <CarvedButton onClick={() => handleOrder(item.name)} className="!w-10 !h-10 !rounded-full text-green-500">
                            <Plus size={20} />
                        </CarvedButton>
                    </div>
                ))}
            </div>
        </div>
    );
};
