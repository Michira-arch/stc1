import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Pizza, Search, ShoppingBag, ArrowLeft } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';

interface AppsLauncherProps {
    onBack: () => void;
    onNavigate: (app: string) => void;
}

export const AppsLauncher: React.FC<AppsLauncherProps> = ({ onBack, onNavigate }) => {
    const apps = [
        {
            id: 'freshman',
            name: 'Freshman Pack',
            image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=500&q=60', // Group of students
            description: 'Campus guide & norms',
            color: 'from-blue-600/80 to-blue-900/80'
        },
        {
            id: 'food',
            name: 'Services',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500&auto=format&fit=crop', // Pizza (Working)
            description: 'Order food & more',
            color: 'from-orange-600/80 to-red-900/80'
        },
        {
            id: 'lost-found',
            name: 'Lost & Found',
            image: 'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=500&q=60', // Lost items/keys
            description: 'Find lost items',
            color: 'from-purple-600/80 to-indigo-900/80'
        },
        {
            id: 'marketplace',
            name: 'Marketplace',
            image: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=500&q=60', // Shopping bag
            description: 'Buy & sell items',
            color: 'from-emerald-600/80 to-teal-900/80'
        },
    ];

    return (
        <div className="min-h-screen bg-ceramic-base dark:bg-[#1A1D21] p-6 pt-12">
            <header className="flex items-center gap-4 mb-8">
                <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full">
                    <ArrowLeft size={24} />
                </CarvedButton>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white">STC APPS</h1>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {apps.map((app, index) => (
                    <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onNavigate(app.id)}
                        className="aspect-square relative overflow-hidden rounded-3xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#151618,-8px_-8px_16px_#35363e] active:scale-95 transition-transform cursor-pointer group"
                    >
                        {/* Background Image */}
                        <img
                            src={app.image}
                            alt={app.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-b ${app.color} p-4 flex flex-col justify-end`}>
                            <h3 className="font-bold text-lg text-white leading-none mb-1 shadow-black/10 drop-shadow-md">{app.name}</h3>
                            <p className="text-xs text-white/80 font-medium line-clamp-2">{app.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
