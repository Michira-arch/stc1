import React, { useState, useEffect } from 'react';
import { INITIAL_RESTAURANTS } from './constants';
import { Restaurant, MenuItem, CartItem } from './types';
import { NeuCard, NeuButton, NeuBadge } from './components/NeuComponents';
import { AIChat } from './components/AIChat';
import { OwnerDashboard } from './components/OwnerDashboard';
import { useApp } from '../../../store/AppContext';

// Export as default for Lazy Loading
const CampusEatsApp: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { theme, toggleTheme } = useApp();
    const isDark = theme === 'dark';
    const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isChefMode, setIsChefMode] = useState(false);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    }

    const handleAddMeal = (restaurantId: string, meal: MenuItem) => {
        setRestaurants(prev => prev.map(r => {
            if (r.id === restaurantId) {
                return { ...r, menu: [...r.menu, meal] };
            }
            return r;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen flex flex-col relative pb-20 bg-ceramic-base dark:bg-[#1A1D21]">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-40 bg-ceramic-100/90 dark:bg-obsidian-800/90 backdrop-blur-md px-4 py-4 md:px-8 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2" onClick={() => { setSelectedRestaurant(null); setIsChefMode(false); }}>
                    {onBack && (
                        <NeuButton variant="icon" onClick={onBack} className="!w-8 !h-8 !p-1 mr-2">
                            <span>←</span>
                        </NeuButton>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold cursor-pointer">C</div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-700 dark:text-slate-100 cursor-pointer">Campus<span className="text-emerald-500">Eats</span></h1>
                </div>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => { setIsChefMode(!isChefMode); setSelectedRestaurant(null); }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isChefMode ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-emerald-500'}`}
                    >
                        {isChefMode ? 'CHEF MODE' : 'USER MODE'}
                    </button>

                    <NeuButton variant="icon" onClick={toggleTheme} className="!w-10 !h-10 !p-2">
                        {isDark ? (
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </NeuButton>

                    <div className="relative">
                        <NeuButton variant="icon" onClick={() => setIsCartOpen(!isCartOpen)} className="!w-10 !h-10 !p-2">
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </NeuButton>
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-ceramic-100 dark:border-obsidian-800">
                                {cart.length}
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto w-full flex-1">

                {isChefMode ? (
                    <OwnerDashboard restaurants={restaurants} onAddMeal={handleAddMeal} />
                ) : (
                    <>
                        {/* Breadcrumb / Back Navigation */}
                        {selectedRestaurant && (
                            <div className="mb-6">
                                <NeuButton onClick={() => setSelectedRestaurant(null)} className="!px-4 !py-2 text-sm flex gap-2">
                                    <span>←</span> Back to Places
                                </NeuButton>
                            </div>
                        )}

                        {!selectedRestaurant ? (
                            // Restaurant List
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="col-span-full mb-4">
                                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Nearby Places</h2>
                                    <p className="text-slate-500 dark:text-slate-400">Fresh food from across campus.</p>
                                </div>
                                {restaurants.map(place => (
                                    <NeuCard key={place.id} className="overflow-hidden group cursor-pointer h-full flex flex-col" onClick={() => setSelectedRestaurant(place)}>
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute bottom-2 right-2">
                                                <NeuBadge>{place.deliveryTime}</NeuBadge>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{place.name}</h3>
                                                <span className="flex items-center text-sm font-bold text-emerald-500">
                                                    ★ {place.rating}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{place.description}</p>
                                            <div className="mt-auto">
                                                <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                                                    {place.menu.length} Items Available
                                                </span>
                                            </div>
                                        </div>
                                    </NeuCard>
                                ))}
                            </div>
                        ) : (
                            // Menu View
                            <div className="animate-fade-in-up">
                                <div className="relative h-64 rounded-3xl overflow-hidden mb-8 shadow-inner">
                                    <img src={selectedRestaurant.image} className="w-full h-full object-cover opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                                        <h2 className="text-4xl font-bold text-white mb-2">{selectedRestaurant.name}</h2>
                                        <p className="text-white/90 max-w-xl">{selectedRestaurant.description}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {selectedRestaurant.menu.map(item => (
                                        <NeuCard key={item.id} className="p-4 flex gap-4 items-center">
                                            <img src={item.image} className="w-24 h-24 rounded-xl object-cover shadow-sm" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{item.name}</h4>
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">KES {item.price}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">{item.description}</p>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {item.tags.map(tag => (
                                                        <span key={tag} className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 bg-ceramic-200 dark:bg-obsidian-800 px-2 py-0.5 rounded-md">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-slate-400">{item.calories} kcal</span>
                                                    <NeuButton variant="primary" onClick={(e) => { e.stopPropagation(); addToCart(item); }} className="!px-3 !py-1 !text-sm">
                                                        Add +
                                                    </NeuButton>
                                                </div>
                                            </div>
                                        </NeuCard>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Floating AI Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <NeuButton variant="primary" onClick={() => setIsChatOpen(true)} className="!rounded-full !w-16 !h-16 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <span className="text-2xl">✨</span>
                </NeuButton>
            </div>

            {/* AI Chat Modal */}
            <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} restaurants={restaurants} />

            {/* Cart Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-ceramic-100 dark:bg-obsidian-900 z-50 shadow-2xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Your Tray</h2>
                        <NeuButton variant="icon" onClick={() => setIsCartOpen(false)} className="!w-8 !h-8 !p-0">
                            ✕
                        </NeuButton>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                        {cart.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">
                                <p>Your tray is empty.</p>
                                <p className="text-sm mt-2">Go find some food!</p>
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="flex justify-between items-center p-3 bg-ceramic-200/50 dark:bg-obsidian-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white dark:bg-black w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</p>
                                            <p className="text-xs text-emerald-500">KES {(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-xs font-bold px-2">
                                        RM
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between mb-4 text-slate-600 dark:text-slate-300">
                            <span>Subtotal</span>
                            <span className="font-bold">KES {cartTotal}</span>
                        </div>
                        <NeuButton variant="primary" className="w-full !py-4 text-lg" disabled={cart.length === 0} onClick={() => alert('Order placed! (This is a demo)')}>
                            Checkout Now
                        </NeuButton>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CampusEatsApp;
