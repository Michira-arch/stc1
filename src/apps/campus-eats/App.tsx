import React, { useState, useEffect } from 'react';
import { Restaurant, MenuItem, CartItem } from './types';
import { NeuCard, NeuButton, NeuBadge } from './components/NeuComponents';
import { AIChat } from './components/AIChat';
import { OwnerDashboard } from './components/OwnerDashboard';
import { useApp } from '../../../store/AppContext';
import { CampusEatsApi } from './services/api';
import { RestaurantRegistrationModal } from './components/RestaurantRegistrationModal';
import { ReviewSection } from './components/ReviewSection';
import { OrderHistory } from './components/OrderHistory';
import { ToastProvider, useToast } from './components/Toast';

const CampusEatsAppContent: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { theme, toggleTheme, currentUser } = useApp();
    const { showToast } = useToast();
    const isDark = theme === 'dark';
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isChefMode, setIsChefMode] = useState(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        setLoading(true);
        const data = await CampusEatsApi.fetchRestaurants();
        setRestaurants(data);
        setLoading(false);
    };

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

    const handleAddMeal = async (restaurantId: string, meal: MenuItem) => {
        // In a real app, we'd call the API here. 
        // For now, OwnerDashboard handles the API call and we just refresh.
        await loadRestaurants();
    };

    const handleCreateRestaurant = async (data: { name: string; description: string; imageUrl: string }) => {
        if (!currentUser) {
            showToast('Please login to create a restaurant', 'info');
            return;
        }

        const newRestaurant = await CampusEatsApi.createRestaurant({
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            ownerId: currentUser.id
        });

        if (newRestaurant) {
            setRestaurants(prev => [...prev, newRestaurant]);
            setIsRegistrationOpen(false);
            // Switch to chef mode and select the new restaurant
            setIsChefMode(true);
            setSelectedRestaurant(null); // OwnerDashboard handles selection
        }
    };

    const handlePlaceOrder = async () => {
        if (!currentUser) {
            showToast('Please login to place an order.', 'info');
            return;
        }

        if (cart.length === 0) return;

        // Group by restaurant (assuming single restaurant ordering for simplicity first, or multi-order)
        // For Pay-on-Pickup, we likely want orders per restaurant. 
        // Let's assume the cart only contains items from ONE restaurant for MVP or we split them.
        // For now, let's just grab the restaurantId from the first item.

        const restaurantId = cart[0].restaurantId;
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderData = {
            restaurantId,
            totalAmount
        };

        const orderItems = cart.map(item => ({
            menuItemId: item.id,
            menuItemName: item.name,
            quantity: item.quantity,
            priceAtTime: item.price
        }));

        const success = await CampusEatsApi.placeOrder(orderData, orderItems);

        if (success) {
            showToast('Order Placed! Please pay on pickup.', 'success');
            setCart([]);
            setIsCartOpen(false);
            setIsOrderHistoryOpen(true);
        } else {
            showToast('Failed to place order. Please try again.', 'error');
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen flex flex-col relative pb-20 bg-ceramic-base dark:bg-[#1A1D21]">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-40 bg-ceramic-100/90 dark:bg-obsidian-800/90 backdrop-blur-md px-3 py-3 md:px-8 flex justify-between items-center shadow-sm transition-all">
                <div className="flex items-center gap-1 md:gap-2" onClick={() => { setSelectedRestaurant(null); setIsChefMode(false); setIsOrderHistoryOpen(false); }}>
                    {onBack && (
                        <NeuButton variant="icon" onClick={onBack} className="!w-8 !h-8 !p-1 mr-1 md:mr-2">
                            <span>←</span>
                        </NeuButton>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold cursor-pointer transform scale-90 md:scale-100">C</div>
                    <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-700 dark:text-slate-100 cursor-pointer">Campus<span className="text-emerald-500">Eats</span></h1>
                </div>

                <div className="flex gap-2 md:gap-4 items-center">
                    <button
                        onClick={() => { setIsChefMode(!isChefMode); setSelectedRestaurant(null); setIsOrderHistoryOpen(false); }}
                        className={`text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-lg transition-colors whitespace-nowrap ${isChefMode ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-emerald-500'}`}
                    >
                        <span className="hidden sm:inline">{isChefMode ? 'CHEF MODE' : 'USER MODE'}</span>
                        <span className="sm:hidden">{isChefMode ? 'CHEF' : 'USER'}</span>
                    </button>

                    <NeuButton variant="icon" onClick={toggleTheme} className="!w-9 !h-9 !p-1.5 md:!w-10 md:!h-10 md:!p-2">
                        {isDark ? (
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </NeuButton>

                    {!isChefMode && (
                        <NeuButton variant="icon" onClick={() => setIsOrderHistoryOpen(!isOrderHistoryOpen)} className={`!w-9 !h-9 !p-1.5 md:!w-10 md:!h-10 md:!p-2 ${isOrderHistoryOpen ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : ''}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </NeuButton>
                    )}

                    <div className="relative">
                        <NeuButton variant="icon" onClick={() => setIsCartOpen(!isCartOpen)} className="!w-9 !h-9 !p-1.5 md:!w-10 md:!h-10 md:!p-2">
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </NeuButton>
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-4 h-4 md:text-xs md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-ceramic-100 dark:border-obsidian-800">
                                {cart.length}
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto w-full flex-1">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                ) : isChefMode ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Restaurant Management</h2>
                            <NeuButton onClick={() => setIsRegistrationOpen(true)} className="!px-4 !py-2 bg-emerald-500 text-white">
                                + open new restaurant
                            </NeuButton>
                        </div>
                        <OwnerDashboard
                            restaurants={restaurants.filter(r => r.ownerId === currentUser?.id)}
                            onAddMeal={handleAddMeal}
                        />
                    </div>
                ) : isOrderHistoryOpen ? (
                    <OrderHistory onBack={() => setIsOrderHistoryOpen(false)} />
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
                                    <NeuCard key={place.id} className="overflow-hidden group cursor-pointer h-full flex flex-col" onClick={() => { setSelectedRestaurant(place); setActiveTab('menu'); }}>
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={place.imageUrl || 'https://via.placeholder.com/400x300'} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
                                                    {place.menu?.length || 0} Items Available
                                                </span>
                                            </div>
                                        </div>
                                    </NeuCard>
                                ))}
                                {restaurants.length === 0 && (
                                    <div className="col-span-full text-center py-20 text-slate-500">
                                        <p className="text-xl">No restaurants found.</p>
                                        <NeuButton onClick={() => { setIsChefMode(true); setIsRegistrationOpen(true); }} className="mt-4">
                                            Be the first to open one!
                                        </NeuButton>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Menu View
                            <div className="animate-fade-in-up">
                                <div className="relative h-64 rounded-3xl overflow-hidden mb-8 shadow-inner group">
                                    <img src={selectedRestaurant.imageUrl || 'https://via.placeholder.com/800x400'} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                                        <h2 className="text-4xl font-bold text-white mb-2">{selectedRestaurant.name}</h2>
                                        <p className="text-white/90 max-w-xl">{selectedRestaurant.description}</p>
                                        <div className="flex items-center gap-4 mt-4">
                                            <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                {selectedRestaurant.deliveryTime}
                                            </span>
                                            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                ★ {selectedRestaurant.rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-1">
                                    <button
                                        onClick={() => setActiveTab('menu')}
                                        className={`pb-2 px-4 text-sm font-bold transition-all relative ${activeTab === 'menu' ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                    >
                                        Menu
                                        {activeTab === 'menu' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full"></span>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`pb-2 px-4 text-sm font-bold transition-all relative ${activeTab === 'reviews' ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                    >
                                        Reviews
                                        {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full"></span>}
                                    </button>
                                </div>

                                {activeTab === 'menu' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                        {selectedRestaurant.menu?.map(item => (
                                            <NeuCard key={item.id} className="p-4 flex gap-4 items-center group hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                                <img src={item.imageUrl || 'https://via.placeholder.com/100'} className="w-24 h-24 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow" />
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
                                                        <NeuButton variant="primary" onClick={(e) => { e.stopPropagation(); addToCart(item); }} className="!px-3 !py-1 !text-sm transform active:scale-95 transition-transform">
                                                            Add +
                                                        </NeuButton>
                                                    </div>
                                                </div>
                                            </NeuCard>
                                        ))}
                                        {(!selectedRestaurant.menu || selectedRestaurant.menu.length === 0) && (
                                            <div className="col-span-full text-center py-10 text-slate-500">
                                                <p>No menu items yet.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="animate-fade-in">
                                        <ReviewSection restaurantId={selectedRestaurant.id} />
                                    </div>
                                )}
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
            <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-ceramic-100/90 dark:bg-obsidian-900/95 z-50 shadow-2xl transform transition-transform duration-300 backdrop-blur-xl ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                        <NeuButton variant="primary" className="w-full !py-4 text-lg" disabled={cart.length === 0} onClick={handlePlaceOrder}>
                            Checkout Now
                        </NeuButton>
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            <RestaurantRegistrationModal
                isOpen={isRegistrationOpen}
                onClose={() => setIsRegistrationOpen(false)}
                onSubmit={handleCreateRestaurant}
            />

        </div>
    );
};

const CampusEatsApp: React.FC<{ onBack?: () => void }> = (props) => (
    <ToastProvider>
        <CampusEatsAppContent {...props} />
    </ToastProvider>
);

export default CampusEatsApp;
