import React, { useState, useEffect } from 'react';
import { Restaurant, MenuItem, Order } from '../types';
import { NeuCard, NeuInput, NeuButton, NeuTextArea, NeuSelect, NeuBadge } from './NeuComponents';
import { CampusEatsApi } from '../services/api';
import { useApp } from '../../../../store/AppContext';
import { useToast } from './Toast';
import { LoadingOverlay } from './LoadingOverlay';
import { compressImage } from '../../../utils/imageUtils';

interface OwnerDashboardProps {
    restaurants: Restaurant[];
    onAddMeal: (restaurantId: string, meal: MenuItem) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ restaurants, onAddMeal }) => {
    const { currentUser } = useApp();
    const { showToast } = useToast();
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(restaurants[0]?.id || '');
    const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'settings'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);

    // Form State
    const [imageMode, setImageMode] = useState<'link' | 'upload'>('link');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [calories, setCalories] = useState('');
    const [category, setCategory] = useState('Main');
    const [tags, setTags] = useState('');
    const [image, setImage] = useState('');
    const [menuImageFile, setMenuImageFile] = useState<File | null>(null);

    // Settings State
    const [settingsImageMode, setSettingsImageMode] = useState<'link' | 'upload'>('upload');
    const [settingsImageFile, setSettingsImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (!selectedRestaurantId && restaurants.length > 0) {
            setSelectedRestaurantId(restaurants[0].id);
        }
    }, [restaurants, selectedRestaurantId]);

    useEffect(() => {
        if (selectedRestaurantId && activeTab === 'orders') {
            loadOrders();

            // Subscribe to real-time updates
            const subscription = CampusEatsApi.subscribeToOrders((payload) => {
                const eventType = payload.eventType;
                if (eventType === 'INSERT') {
                    // Start simplified: reload to get relationships/orderNumber
                    loadOrders();
                    showToast('New Order Received!', 'info');
                } else if (eventType === 'UPDATE') {
                    setOrders(prev => prev.map(o =>
                        o.id === payload.new.id ? { ...o, ...payload.new } : o
                    ));
                }
            }, { restaurantId: selectedRestaurantId });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [selectedRestaurantId, activeTab]);

    const loadOrders = async () => {
        if (!selectedRestaurantId) return;
        const data = await CampusEatsApi.fetchOrders({ restaurantId: selectedRestaurantId });
        setOrders(data);
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        const success = await CampusEatsApi.updateOrderStatus(orderId, newStatus);
        if (success) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
            showToast(`Order status updated to ${newStatus}`, 'success');
        } else {
            showToast('Failed to update status', 'error');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setMenuImageFile(compressed);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage(reader.result as string);
                };
                reader.readAsDataURL(compressed);
            } catch (error) {
                console.error("Compression failed", error);
                setMenuImageFile(file); // Fallback
            }
        }
    };

    const handleSubmit = async () => {
        if (!name || !price || !description || !selectedRestaurantId) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            let finalImageUrl = image;

            if (imageMode === 'upload' && menuImageFile) {
                const path = `menu/${Date.now()}_${menuImageFile.name}`;
                const uploadedUrl = await CampusEatsApi.uploadFile(menuImageFile, path);
                if (uploadedUrl) {
                    finalImageUrl = uploadedUrl;
                } else {
                    showToast('Failed to upload image', 'error');
                    setIsSubmitting(false);
                    return;
                }
            } else if (imageMode === 'link' && !image) {
                finalImageUrl = 'https://picsum.photos/200/200';
            }

            const newMeal: Partial<MenuItem> = {
                restaurantId: selectedRestaurantId,
                name,
                description,
                price: parseFloat(price),
                calories: parseInt(calories) || 0,
                imageUrl: finalImageUrl,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            const createdMeal = await CampusEatsApi.addMenuItem(newMeal);

            if (createdMeal) {
                onAddMeal(selectedRestaurantId, createdMeal);
                setName('');
                setDescription('');
                setPrice('');
                setCalories('');
                setTags('');
                setImage('');
                setMenuImageFile(null);
                showToast('Meal added successfully!', 'success');
            }
        } catch (error) {
            console.error('Failed to add meal', error);
            showToast('Failed to add meal', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (restaurants.length === 0) {
        return (
            <div className="text-center py-20 text-slate-400">
                <p>You don't have any restaurants yet.</p>
                <p>Register one to start adding meals!</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Chef Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage your restaurant.</p>
                </div>
                <div className="flex gap-2 bg-ceramic-100 dark:bg-obsidian-900 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                        Live Orders {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length > 0 && `(${orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})`}
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'menu' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                        Menu Management
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {activeTab !== 'settings' && (
                <NeuCard className="p-6 mb-8">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Select Restaurant</label>
                    <NeuSelect
                        value={selectedRestaurantId}
                        onChange={(e) => setSelectedRestaurantId(e.target.value)}
                    >
                        {restaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </NeuSelect>
                </NeuCard>
            )}

            {activeTab === 'orders' ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map(order => (
                            <NeuCard key={order.id} className={`flex flex-col border-t-8 ${order.status === 'ready' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-blue-500'}`}>
                                <div className="p-4 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                            #{order.orderNumber !== undefined ? order.orderNumber : order.id.slice(0, 4)}
                                        </h3>
                                        <NeuBadge>{order.status.toUpperCase()}</NeuBadge>
                                    </div>

                                    {order.status === 'cancelled' && order.reassignedToOrderId && (
                                        <div className="mb-4 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 p-2 rounded-lg text-xs font-bold border border-orange-200 dark:border-orange-800">
                                            ⚠ Reassigned to Order #{orders.find(o => o.id === order.reassignedToOrderId)?.orderNumber || '...'}
                                        </div>
                                    )}
                                    <div className="space-y-2 mb-4">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                                <span>{item.quantity}x {item.menuItemName}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        Total: KES {order.totalAmount}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                    {order.status === 'pending' && (
                                        <NeuButton className="w-full bg-blue-500 text-white" onClick={() => handleStatusUpdate(order.id, 'preparing')}>
                                            Start Preparing
                                        </NeuButton>
                                    )}
                                    {order.status === 'preparing' && (
                                        <NeuButton className="w-full bg-emerald-500 text-white" onClick={() => handleStatusUpdate(order.id, 'ready')}>
                                            Mark Ready
                                        </NeuButton>
                                    )}
                                    {order.status === 'ready' && (
                                        <NeuButton className="w-full bg-slate-500 text-white" onClick={() => handleStatusUpdate(order.id, 'delivered')}>
                                            Picked Up
                                        </NeuButton>
                                    )}
                                    {order.status === 'cancelled' && (
                                        <NeuButton className="w-full bg-slate-400 text-white" onClick={() => handleStatusUpdate(order.id, 'pending')}>
                                            Un-Cancel (Re-open)
                                        </NeuButton>
                                    )}
                                </div>
                            </NeuCard>
                        ))}
                    </div>
                    {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <p className="text-xl font-bold">Kitchen Clear! 👨‍🍳</p>
                            <p>No active orders right now.</p>
                        </div>
                    )}
                </div>
            ) : activeTab === 'menu' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Preview */}
                    <div className="space-y-6">
                        <NeuCard className="p-6 flex flex-col items-center text-center">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Live Preview</h3>
                            <div className="w-full max-w-[250px]">
                                <div className="bg-ceramic-100 dark:bg-obsidian-900 rounded-2xl overflow-hidden shadow-inner p-3">
                                    <img src={image || 'https://via.placeholder.com/200'} className="w-full h-32 object-cover rounded-xl mb-3" />
                                    <div className="text-left">
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{name || 'Meal Name'}</div>
                                            <div className="text-emerald-500 text-sm font-bold">KES {price || '0'}</div>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1 line-clamp-2">{description || 'Delicious description...'}</div>
                                    </div>
                                </div>
                            </div>
                        </NeuCard>
                    </div>

                    {/* Right Col: Form */}
                    <div className="lg:col-span-2">
                        <NeuCard className="p-8">
                            <h3 className="font-bold text-lg mb-6">Add New Menu Item</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Meal Name</label>
                                    <NeuInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Swahili Pilau" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Price (KES)</label>
                                    <NeuInput type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 500" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Description</label>
                                <NeuTextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the ingredients and taste..." />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Category</label>
                                    <NeuSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option>Main</option>
                                        <option>Side</option>
                                        <option>Drink</option>
                                        <option>Dessert</option>
                                        <option>Special</option>
                                    </NeuSelect>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Calories</label>
                                    <NeuInput type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="e.g. 650" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Tags (comma separated)</label>
                                <NeuInput value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vegan, spicy, halal" />
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">Meal Image</label>
                                    <div className="flex bg-ceramic-200 dark:bg-obsidian-800 rounded-lg p-1">
                                        <button
                                            onClick={() => setImageMode('link')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${imageMode === 'link' ? 'bg-white dark:bg-obsidian-900 shadow-sm text-emerald-500' : 'text-slate-400'}`}
                                        >Link</button>
                                        <button
                                            onClick={() => setImageMode('upload')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${imageMode === 'upload' ? 'bg-white dark:bg-obsidian-900 shadow-sm text-emerald-500' : 'text-slate-400'}`}
                                        >Upload</button>
                                    </div>
                                </div>

                                {imageMode === 'link' ? (
                                    <NeuInput value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-emerald-500 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            <p className="text-sm text-slate-500"><span className="font-semibold">Click to upload</span></p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>

                            <NeuButton variant="primary" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Adding Meal...' : 'Create Meal'}
                            </NeuButton>
                        </NeuCard>
                    </div>
                </div>
            ) : (
                // Settings Tab
                <div className="max-w-2xl mx-auto">
                    <NeuCard className="p-8">
                        <h3 className="font-bold text-xl mb-6 text-slate-800 dark:text-slate-100">Restaurant Settings</h3>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Select Restaurant to Edit</label>
                            <NeuSelect
                                value={selectedRestaurantId}
                                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                            >
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </NeuSelect>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">Restaurant Image</label>
                                    <div className="flex bg-ceramic-200 dark:bg-obsidian-800 rounded-lg p-1">
                                        <button
                                            onClick={() => setSettingsImageMode('upload')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${settingsImageMode === 'upload' ? 'bg-white dark:bg-obsidian-900 shadow-sm text-emerald-500' : 'text-slate-400'}`}
                                        >Upload</button>
                                        <button
                                            onClick={() => setSettingsImageMode('link')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${settingsImageMode === 'link' ? 'bg-white dark:bg-obsidian-900 shadow-sm text-emerald-500' : 'text-slate-400'}`}
                                        >Link</button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 group">
                                        <img
                                            src={restaurants.find(r => r.id === selectedRestaurantId)?.imageUrl || 'https://via.placeholder.com/800x400'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            alt="Restaurant Cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                    </div>

                                    {settingsImageMode === 'link' ? (
                                        <div className="flex gap-2">
                                            <NeuInput
                                                placeholder="Enter new image URL..."
                                                onChange={(e) => {
                                                    // No-op for now, relying on DOM read on save for this legacy input style
                                                }}
                                                id="new-restaurant-image"
                                            />
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                <p className="text-sm text-slate-500"><span className="font-semibold">Click to upload</span></p>
                                                {settingsImageFile && <p className="text-xs text-emerald-500 mt-2 font-bold">{settingsImageFile.name}</p>}
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    if (e.target.files?.[0]) {
                                                        const file = e.target.files[0];
                                                        try {
                                                            const compressed = await compressImage(file);
                                                            setSettingsImageFile(compressed);
                                                        } catch (err) {
                                                            console.error("Compression failed", err);
                                                            setSettingsImageFile(file);
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}

                                    <p className="text-xs text-slate-400 mt-2">
                                        {settingsImageMode === 'link' ? "Paste a URL for the restaurant's cover image." : "Upload a new cover image (Max 5MB)."}
                                    </p>
                                </div>
                            </div>

                            <NeuButton
                                variant="primary"
                                className="w-full"
                                onClick={async () => {
                                    let newUrl = '';

                                    if (settingsImageMode === 'link') {
                                        const input = document.getElementById('new-restaurant-image') as HTMLInputElement;
                                        newUrl = input?.value;
                                    } else if (settingsImageFile) {
                                        setIsSubmitting(true);
                                        const path = `restaurants/cover_${Date.now()}_${settingsImageFile.name}`;
                                        const uploadedUrl = await CampusEatsApi.uploadFile(settingsImageFile, path);
                                        if (uploadedUrl) {
                                            newUrl = uploadedUrl;
                                        } else {
                                            showToast('Failed to upload image.', 'error');
                                            setIsSubmitting(false);
                                            return;
                                        }
                                    }

                                    if (!newUrl) {
                                        showToast('Please provide an image.', 'error');
                                        setIsSubmitting(false);
                                        return;
                                    }

                                    setIsSubmitting(true);
                                    const success = await CampusEatsApi.updateRestaurant(selectedRestaurantId, { imageUrl: newUrl });
                                    setIsSubmitting(false);
                                    setSettingsImageFile(null); // Clear file

                                    if (success) {
                                        showToast('Restaurant updated successfully!', 'success');
                                        setTimeout(() => window.location.reload(), 1500);
                                    } else {
                                        showToast('Failed to update restaurant.', 'error');
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                            </NeuButton>
                        </div>
                    </NeuCard>
                </div>
            )}

            {/* Loading Overlay for Submitting */}
            <LoadingOverlay isLoading={isSubmitting} text="Processing..." />
        </div>
    );
};
