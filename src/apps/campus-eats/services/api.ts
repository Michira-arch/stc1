import { supabase } from '../../../../store/supabaseClient';
import { Restaurant, MenuItem, Order, OrderItem, Review } from '../types';

export const CampusEatsApi = {
    // Restaurants
    fetchRestaurants: async (): Promise<Restaurant[]> => {
        const { data, error } = await supabase
            .from('campuseats_restaurants' as any)
            .select(`
                *,
                menu:campuseats_menu_items(*)
            `)
            .eq('is_active', true)
            .eq('campuseats_menu_items.is_available', true);

        if (error) {
            console.error('Error fetching restaurants:', error);
            return [];
        }

        return (data as any[]).map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            imageUrl: r.image_url,
            deliveryTime: r.delivery_time,
            rating: r.rating,
            ownerId: r.owner_id,
            isActive: r.is_active,
            menu: r.menu ? r.menu.map((m: any) => ({
                id: m.id,
                restaurantId: m.restaurant_id,
                name: m.name,
                description: m.description,
                price: m.price,
                imageUrl: m.image_url,
                category: m.category,
                isAvailable: m.is_available,
                calories: m.calories,
                tags: m.tags || []
            })) : []
        }));
    },

    createRestaurant: async (restaurant: Partial<Restaurant>): Promise<Restaurant | null> => {
        const { data, error } = await supabase
            .from('campuseats_restaurants' as any)
            .insert({
                name: restaurant.name,
                description: restaurant.description,
                image_url: restaurant.imageUrl,
                owner_id: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating restaurant:', error);
            return null;
        }

        // Helper to cast single result
        const r = data as any;
        return {
            id: r.id,
            name: r.name,
            description: r.description,
            imageUrl: r.image_url,
            deliveryTime: r.delivery_time,
            rating: r.rating,
            ownerId: r.owner_id,
            isActive: r.is_active,
            menu: []
        };
    },

    updateRestaurant: async (restaurantId: string, updates: Partial<Restaurant>): Promise<boolean> => {
        const { error } = await supabase
            .from('campuseats_restaurants' as any)
            .update({
                image_url: updates.imageUrl,
                // Add other fields here if needed in future
            })
            .eq('id', restaurantId);

        if (error) {
            console.error('Error updating restaurant:', error);
            return false;
        }
        return true;
    },

    // Menu Items
    addMenuItem: async (item: Partial<MenuItem>): Promise<MenuItem | null> => {
        const { data, error } = await supabase
            .from('campuseats_menu_items' as any)
            .insert({
                restaurant_id: item.restaurantId,
                name: item.name,
                description: item.description,
                price: item.price,
                image_url: item.imageUrl,
                category: item.category,
                calories: item.calories,
                tags: item.tags
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding menu item:', error);
            return null;
        }

        const m = data as any;
        return {
            id: m.id,
            restaurantId: m.restaurant_id,
            name: m.name,
            description: m.description,
            price: m.price,
            imageUrl: m.image_url,
            category: m.category,
            isAvailable: m.is_available,
            calories: m.calories,
            tags: m.tags
        };
    },

    // Orders
    placeOrder: async (order: Partial<Order>, items: Partial<OrderItem>[]): Promise<boolean> => {
        try {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('campuseats_orders' as any)
                .insert({
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    restaurant_id: order.restaurantId,
                    total_amount: order.totalAmount,
                    status: 'pending'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            const newOrder = orderData as any;

            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: newOrder.id,
                menu_item_id: item.menuItemId,
                menu_item_name: item.menuItemName,
                quantity: item.quantity,
                price_at_time: item.priceAtTime
            }));

            const { error: itemsError } = await supabase
                .from('campuseats_order_items' as any)
                .insert(orderItems);

            if (itemsError) throw itemsError;

            return true;

        } catch (error) {
            console.error('Error placing order:', error);
            return false;
        }
    },

    fetchOrders: async (filters: { restaurantId?: string, userId?: string }): Promise<Order[]> => {
        let query = supabase
            .from('campuseats_orders' as any)
            .select(`
                *,
                items:campuseats_order_items(*),
                restaurant:campuseats_restaurants(name)
            `)
            .order('created_at', { ascending: false });

        if (filters.restaurantId) {
            query = query.eq('restaurant_id', filters.restaurantId);
        }

        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return (data as any[]).map((o: any) => ({
            id: o.id,
            userId: o.user_id,
            restaurantId: o.restaurant_id,
            restaurantName: o.restaurant?.name,
            totalAmount: o.total_amount,
            status: o.status,
            paymentStatus: o.payment_status,
            createdAt: o.created_at,
            specialInstructions: o.special_instructions,
            items: o.items ? o.items.map((i: any) => ({
                id: i.id,
                orderId: i.order_id,
                menuItemId: i.menu_item_id,
                menuItemName: i.menu_item_name,
                quantity: i.quantity,
                priceAtTime: i.price_at_time
            })) : [],
            orderNumber: o.order_number,
            reassignedToOrderId: o.reassigned_to_order_id
        }));
    },

    updateOrderStatus: async (orderId: string, status: string): Promise<boolean> => {
        const { error } = await supabase
            .from('campuseats_orders' as any)
            .update({ status })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            return false;
        }
        return true;
    },

    // Smart Cancellation
    cancelOrder: async (orderId: string, restaurantId: string): Promise<boolean> => {
        try {
            // 1. Get current order items
            const { data: currentOrderItems, error: itemsError } = await supabase
                .from('campuseats_order_items' as any)
                .select('*')
                .eq('order_id', orderId);

            if (itemsError || !currentOrderItems) throw new Error('Could not fetch items');

            // 2. Find other PENDING orders for same restaurant (exclude current)
            const { data: pendingOrders, error: pendingError } = await supabase
                .from('campuseats_orders' as any)
                .select(`
                    id,
                    items:campuseats_order_items(*)
                `)
                .eq('restaurant_id', restaurantId)
                .eq('status', 'pending')
                .neq('id', orderId)
                .order('created_at', { ascending: true }); // Prioritize oldest

            if (pendingError) throw pendingError;

            let reassignedId = null;

            // 3. Try to find a match
            // A match means SAME items and SAME quantities.
            // Simplification: We check if the pending order has EXACTLY the same items as the cancelled one.
            // Realistically, partial matches are complex. We'll do exact matches only for now.
            if (pendingOrders) {
                const candidates = pendingOrders as any[]; // Fix TS inference error
                for (const potentialMatch of candidates) {
                    const matchItems = potentialMatch.items as any[];
                    if (matchItems.length !== currentOrderItems.length) continue;

                    // Sort and compare
                    const currentItemsAny = currentOrderItems as any[];
                    const sortedCurrent = [...currentItemsAny].sort((a: any, b: any) => a.menu_item_id.localeCompare(b.menu_item_id));
                    const sortedMatch = [...matchItems].sort((a: any, b: any) => a.menu_item_id.localeCompare(b.menu_item_id));

                    let isMatch = true;
                    for (let i = 0; i < sortedCurrent.length; i++) {
                        if (
                            sortedCurrent[i].menu_item_id !== sortedMatch[i].menu_item_id ||
                            sortedCurrent[i].quantity !== sortedMatch[i].quantity
                        ) {
                            isMatch = false;
                            break;
                        }
                    }

                    if (isMatch) {
                        reassignedId = potentialMatch.id;
                        break;
                    }
                }
            }

            // 4. Update status and reassignment
            const { error: updateError } = await supabase
                .from('campuseats_orders' as any)
                .update({
                    status: 'cancelled',
                    reassigned_to_order_id: reassignedId
                })
                .eq('id', orderId);

            if (updateError) throw updateError;

            return true;

        } catch (error) {
            console.error('Error cancelling order:', error);
            return false;
        }
    },

    subscribeToOrders: (
        callback: (payload: any) => void,
        filters: { restaurantId?: string, userId?: string }
    ) => {
        let filterString = '';
        if (filters.restaurantId) filterString = `restaurant_id=eq.${filters.restaurantId}`;
        if (filters.userId) filterString = `user_id=eq.${filters.userId}`;

        // If filtering by user, we ideally only listen to that user's rows.
        // However, RLS might handle visibility. Supabase realtime respects RLS if configured with WAL.
        // We'll trust the client filter logic for now or listen to correct table.

        return supabase
            .channel('campuseats-orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'campuseats_orders',
                    filter: filterString || undefined
                },
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();
    },

    // Reviews
    fetchReviews: async (restaurantId: string): Promise<Review[]> => {
        const { data, error } = await supabase
            .from('campuseats_reviews' as any)
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }

        return (data as any[]).map((r: any) => ({
            id: r.id,
            restaurantId: r.restaurant_id,
            userId: r.user_id,
            userName: r.user_name || 'Anonymous', // Fallback
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at
        }));
    },

    addReview: async (review: Partial<Review>): Promise<Review | null> => {
        const { data, error } = await supabase
            .from('campuseats_reviews' as any)
            .insert({
                restaurant_id: review.restaurantId,
                user_id: review.userId,
                user_name: review.userName,
                rating: review.rating,
                comment: review.comment
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding review:', error.message || JSON.stringify(error));
            return null;
        }

        const r = data as any;
        return {
            id: r.id,
            restaurantId: r.restaurant_id,
            userId: r.user_id,
            userName: r.user_name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at
        };
    },

    // Storage
    uploadFile: async (file: File, path: string): Promise<string | null> => {
        try {
            const { uploadToR2 } = await import('../../../lib/r2');
            const publicUrl = await uploadToR2(file, 'campuseats-assets');
            return publicUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    }
};
