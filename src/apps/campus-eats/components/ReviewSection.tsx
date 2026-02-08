import React, { useState, useEffect } from 'react';
import { CampusEatsApi } from '../services/api';
import { Review } from '../types';
import { supabase } from '../../../../store/supabaseClient';

interface ReviewSectionProps {
    restaurantId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ restaurantId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadReviews();
        checkUser();
    }, [restaurantId]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const loadReviews = async () => {
        setLoading(true);
        const data = await CampusEatsApi.fetchReviews(restaurantId);
        setReviews(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to review');
            return;
        }

        setSubmitting(true);
        const review = await CampusEatsApi.addReview({
            restaurantId,
            userId: user.id,
            userName: user.email?.split('@')[0] || 'User', // Simple username derivation
            rating: newRating,
            comment: newComment
        });

        if (review) {
            setReviews([review, ...reviews]);
            setShowForm(false);
            setNewComment('');
            setNewRating(5);
        } else {
            alert('Failed to submit review');
        }
        setSubmitting(false);
    };

    return (
        <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Reviews ({reviews.length})</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30"
                >
                    {showForm ? 'Cancel' : 'Write a Review'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-down">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className={`text-2xl transition-transform hover:scale-110 ${star <= newRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            rows={3}
                            placeholder="Share your experience..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Post Review'}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    No reviews yet. Be the first to review!
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-semibold text-gray-900 dark:text-white block">{review.userName}</span>
                                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex text-yellow-400 text-sm">
                                    {'★'.repeat(review.rating)}
                                    <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
