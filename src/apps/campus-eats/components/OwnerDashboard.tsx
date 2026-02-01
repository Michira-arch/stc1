import React, { useState } from 'react';
import { Restaurant, MenuItem } from '../types';
import { NeuCard, NeuInput, NeuButton, NeuTextArea, NeuSelect } from './NeuComponents';

interface OwnerDashboardProps {
    restaurants: Restaurant[];
    onAddMeal: (restaurantId: string, meal: MenuItem) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ restaurants, onAddMeal }) => {
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(restaurants[0]?.id || '');
    const [imageMode, setImageMode] = useState<'link' | 'upload'>('link');

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [calories, setCalories] = useState('');
    const [category, setCategory] = useState('Main');
    const [tags, setTags] = useState('');
    const [image, setImage] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!name || !price || !description || !selectedRestaurantId) return;

        const newMeal: MenuItem = {
            id: `m-${Date.now()}`,
            name,
            description,
            price: parseFloat(price),
            calories: parseInt(calories) || 0,
            image: image || 'https://picsum.photos/200/200',
            category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        onAddMeal(selectedRestaurantId, newMeal);

        // Reset form
        setName('');
        setDescription('');
        setPrice('');
        setCalories('');
        setTags('');
        setImage('');
        alert('Meal added successfully!');
    };

    return (
        <div className="animate-fade-in-up pb-12">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Chef Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage your menu items and offerings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Restaurant Select & Preview */}
                <div className="space-y-6">
                    <NeuCard className="p-6">
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

                        <NeuButton variant="primary" className="w-full" onClick={handleSubmit}>
                            Create Meal
                        </NeuButton>
                    </NeuCard>
                </div>
            </div>
        </div>
    );
};
