export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    calories: number;
    image: string;
    category: string;
    tags: string[]; // e.g., 'vegan', 'gluten-free', 'spicy'
}

export interface Restaurant {
    id: string;
    name: string;
    description: string;
    rating: number;
    deliveryTime: string;
    image: string;
    menu: MenuItem[];
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    isThinking?: boolean;
}
