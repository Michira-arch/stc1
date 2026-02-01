import React, { useState } from 'react';
import { NeuCard, NeuButton, NeuBadge } from '../components/Neu';
import { Download, ShoppingBag, BookOpen, Camera, Cpu } from 'lucide-react';
import { MarketItem } from '../types';

const ITEMS: MarketItem[] = [
    {
        id: '1',
        title: 'Advanced Calc II Notion Template',
        type: 'Digital',
        price: 650,
        image: 'https://picsum.photos/300/200?random=1',
        author: { id: 'u1', name: 'Alex', avatar: '', university: '', year: '', rating: 5 },
        description: 'Complete with latex formulas and exam prep sheets.'
    },
    {
        id: '2',
        title: 'Canon DSLR Rental (Weekend)',
        type: 'Rental',
        price: 4500,
        image: 'https://picsum.photos/300/200?random=2',
        author: { id: 'u2', name: 'Maria', avatar: '', university: '', year: '', rating: 5 },
        description: 'Includes 50mm lens and bag. Perfect for film students.'
    },
    {
        id: '3',
        title: 'Bio 101 Finals Survival Kit',
        type: 'Physical',
        price: 2000,
        image: 'https://picsum.photos/300/200?random=3',
        author: { id: 'u3', name: 'Jake', avatar: '', university: '', year: '', rating: 5 },
        description: 'Energy drinks, flashcards, and cliff notes.'
    },
    {
        id: '4',
        title: 'Graphing Calculator TI-84',
        type: 'Rental',
        price: 1300,
        image: 'https://picsum.photos/300/200?random=4',
        author: { id: 'u4', name: 'Sam', avatar: '', university: '', year: '', rating: 5 },
        description: 'Rent for the semester or just for finals week.'
    },
];

const Marketplace: React.FC = () => {
    const [filter, setFilter] = useState<'All' | 'Digital' | 'Physical' | 'Rental'>('All');

    const filteredItems = filter === 'All' ? ITEMS : ITEMS.filter(i => i.type === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Asset Marketplace</h2>
                    <p className="text-slate-500">Buy, sell, or rent campus essentials.</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    {(['All', 'Digital', 'Physical', 'Rental'] as const).map(f => (
                        <NeuButton
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm ${filter === f ? 'text-emerald-500' : ''}`}
                        >
                            {f}
                        </NeuButton>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map(item => (
                    <NeuCard key={item.id} className="overflow-hidden flex flex-col h-full group">
                        <div className="relative h-40 overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute top-2 right-2">
                                <NeuBadge type="info">{item.type}</NeuBadge>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-1 text-slate-800 dark:text-slate-100 line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-slate-500 mb-3">{item.description}</p>

                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-xl font-bold text-emerald-500">KSh {item.price}</span>
                                <NeuButton className="p-2 rounded-full">
                                    {item.type === 'Digital' ? <Download size={18} /> : <ShoppingBag size={18} />}
                                </NeuButton>
                            </div>
                        </div>
                    </NeuCard>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
