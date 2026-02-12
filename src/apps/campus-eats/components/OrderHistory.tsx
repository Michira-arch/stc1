import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { CampusEatsApi } from '../services/api';
import { NeuCard, NeuBadge } from './NeuComponents';
import { useApp } from '../../../../store/AppContext';
import { useToast } from './Toast';

interface OrderHistoryProps {
    onBack: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack }) => {
    const { currentUser } = useApp();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            loadOrders();

            // Subscribe to real-time updates
            const subscription = CampusEatsApi.subscribeToOrders((payload) => {
                if (payload.eventType === 'INSERT') {
                    // Start simplified: reload all. Optimization: fetch single and append.
                    // For now, reload is safe and easy.
                    loadOrders();
                } else if (payload.eventType === 'UPDATE') {
                    const mapped = CampusEatsApi.mapRawOrder(payload.new);
                    setOrders(prev => prev.map(o =>
                        o.id === mapped.id ? { ...o, ...mapped } : o
                    ));
                }
            }, { userId: currentUser.id });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [currentUser]);

    const loadOrders = async () => {
        setLoading(true);
        if (currentUser) {
            const data = await CampusEatsApi.fetchOrders({ userId: currentUser.id });
            setOrders(data);
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ready': return 'bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse';
            case 'delivered': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const handleCancel = async (orderId: string, restaurantId: string) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o));
        showToast('Cancelling order...', 'info');

        const success = await CampusEatsApi.cancelOrder(orderId, restaurantId);
        if (!success) {
            showToast('Failed to cancel order.', 'error');
            loadOrders(); // Revert
        } else {
            showToast('Order cancelled.', 'success');
        }
    };

    return (
        <div className="animate-fade-in-up pb-20">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Orders</h2>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <p>No orders yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <NeuCard key={order.id} className="p-4 border-l-4 border-transparent hover:border-emerald-500 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                                        {order.restaurantName || 'Restaurant'}
                                        <span className="ml-2 text-sm font-normal text-slate-500">#{order.orderNumber || order.id.slice(0, 4)}</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                    {order.status.toUpperCase()}
                                </div>
                            </div>

                            <div className="space-y-2 mb-3">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                                        <span>{item.quantity}x {item.menuItemName}</span>
                                        <span>KES {item.priceAtTime * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="font-bold text-slate-800 dark:text-slate-200">Total: KES {order.totalAmount}</span>
                                <div className="flex gap-2 items-center">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancel(order.id, order.restaurantId)}
                                            className="text-red-500 text-xs font-bold hover:underline"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    {order.status === 'ready' && (
                                        <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                                            Ready for Pickup!
                                        </span>
                                    )}
                                </div>
                            </div>
                        </NeuCard>
                    ))}
                </div>
            )}
        </div>
    );
};
