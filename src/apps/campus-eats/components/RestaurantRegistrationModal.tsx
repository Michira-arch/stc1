import React, { useState } from 'react';
import { NeuCard, NeuInput, NeuButton, NeuTextArea } from './NeuComponents';
import { useToast } from './Toast';
import { LoadingOverlay } from './LoadingOverlay';
import { compressImage } from '../../../utils/imageUtils';

interface RestaurantRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string; imageUrl: string }) => Promise<void>;
}

export const RestaurantRegistrationModal: React.FC<RestaurantRegistrationModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState<'link' | 'upload'>('upload');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressed = await compressImage(file);
                setImageFile(compressed);
            } catch (error) {
                console.error("Compression failed", error);
                setImageFile(file);
            }
        }
    };

    const handleSubmit = async () => {
        if (!name || !description) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        setLoading(true);
        try {
            let finalImageUrl = imageUrl;

            if (uploadMode === 'upload' && imageFile) {
                // Generate a unique path: restaurants/TIMESTAMP_FILENAME
                const path = `restaurants/${Date.now()}_${imageFile.name}`;
                const uploadedUrl = await import('../services/api').then(m => m.CampusEatsApi.uploadFile(imageFile, path));

                if (uploadedUrl) {
                    finalImageUrl = uploadedUrl;
                } else {
                    showToast('Failed to upload image', 'error');
                    setLoading(false);
                    return;
                }
            }

            await onSubmit({ name, description, imageUrl: finalImageUrl });
            showToast('Restaurant registered successfully!', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in">
            <NeuCard className="w-full max-w-md p-8 relative animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-6">Open Your Restaurant</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Restaurant Name</label>
                        <NeuInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Mama Oliech's"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Description</label>
                        <NeuTextArea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell us about your food..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase">Cover Image</label>
                            <div className="flex bg-ceramic-100 dark:bg-obsidian-900 rounded-lg p-1">
                                <button
                                    onClick={() => setUploadMode('upload')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${uploadMode === 'upload' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Upload
                                </button>
                                <button
                                    onClick={() => setUploadMode('link')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${uploadMode === 'link' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Link
                                </button>
                            </div>
                        </div>

                        {uploadMode === 'link' ? (
                            <NeuInput
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    <p className="text-sm text-slate-500"><span className="font-semibold">Click to upload</span></p>
                                    {imageFile && <p className="text-xs text-emerald-500 mt-2 font-bold">{imageFile.name}</p>}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>

                    <NeuButton
                        variant="primary"
                        className="w-full !py-3 mt-4"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register Restaurant'}
                    </NeuButton>
                </div>

                <LoadingOverlay isLoading={loading} text="Creating Restaurant..." />
            </NeuCard>
        </div>
    );
};
