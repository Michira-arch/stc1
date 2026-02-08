export interface MenuItem {
    id: string;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    isAvailable: boolean;
    calories: number;
    tags: string[];
}

export interface Restaurant {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    deliveryTime: string;
    rating: number;
    ownerId?: string;
    isActive: boolean;
    menu?: MenuItem[]; // Optional because sometimes we fetch without menu
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    restaurantId: string;
    restaurantName?: string; // Added for UI convenience
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    paymentStatus: string;
    specialInstructions?: string;
    createdAt: string;
    orderNumber?: number; // Short ID
    reassignedToOrderId?: string; // If cancelled and moved
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    orderId: string;
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    priceAtTime: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    isThinking?: boolean;
}

export interface Review {
    id: string;
    restaurantId: string;
    userId: string;
    userName: string; // Simplification: store name here or fetch from user
    rating: number;
    comment: string;
    createdAt: string;
}
