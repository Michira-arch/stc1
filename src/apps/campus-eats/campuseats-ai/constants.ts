import { Restaurant } from './types';

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Green Leaf Commons',
    description: 'Fresh, organic, and sustainable bowls and salads.',
    rating: 4.8,
    deliveryTime: '15-20 min',
    image: 'https://picsum.photos/400/300?random=1',
    menu: [
      {
        id: 'm1',
        name: 'Buddha Power Bowl',
        description: 'Quinoa, chickpeas, roasted sweet potato, kale, avocado, tahini dressing.',
        price: 1250,
        calories: 650,
        image: 'https://picsum.photos/200/200?random=10',
        category: 'Bowls',
        tags: ['vegan', 'gluten-free', 'high-protein']
      },
      {
        id: 'm2',
        name: 'Spicy Tofu Salad',
        description: 'Crispy tofu, mixed greens, cucumber, spicy peanut dressing.',
        price: 950,
        calories: 450,
        image: 'https://picsum.photos/200/200?random=11',
        category: 'Salads',
        tags: ['vegan', 'spicy']
      }
    ]
  },
  {
    id: 'r2',
    name: 'Night Owl Grill',
    description: 'Classic campus grill open late. Burgers, fries, and shakes.',
    rating: 4.5,
    deliveryTime: '25-35 min',
    image: 'https://picsum.photos/400/300?random=2',
    menu: [
      {
        id: 'm3',
        name: 'Double Smash Burger',
        description: 'Two beef patties, american cheese, house sauce, pickles.',
        price: 1400,
        calories: 900,
        image: 'https://picsum.photos/200/200?random=12',
        category: 'Burgers',
        tags: ['meat', 'comfort-food']
      },
      {
        id: 'm4',
        name: 'Loaded Cheese Fries',
        description: 'Crispy fries topped with melted cheddar, bacon bits, and scallions.',
        price: 850,
        calories: 700,
        image: 'https://picsum.photos/200/200?random=13',
        category: 'Sides',
        tags: ['comfort-food']
      }
    ]
  },
  {
    id: 'r3',
    name: 'Zen Sushi & Bento',
    description: 'Premium sushi rolls and japanese comfort food.',
    rating: 4.9,
    deliveryTime: '30-40 min',
    image: 'https://picsum.photos/400/300?random=3',
    menu: [
      {
        id: 'm5',
        name: 'Spicy Tuna Roll',
        description: 'Fresh tuna, spicy mayo, cucumber, topped with sesame seeds.',
        price: 1100,
        calories: 320,
        image: 'https://picsum.photos/200/200?random=14',
        category: 'Sushi',
        tags: ['seafood', 'spicy']
      },
      {
        id: 'm6',
        name: 'Chicken Katsu Bento',
        description: 'Crispy chicken cutlet, rice, miso soup, and pickles.',
        price: 1600,
        calories: 850,
        image: 'https://picsum.photos/200/200?random=15',
        category: 'Bento',
        tags: ['meat']
      }
    ]
  }
];

export const AI_SYSTEM_INSTRUCTION = `You are "EatsBot", an advanced campus food concierge.
You have access to the current campus menus provided in the context.
Your goal is to help students find food based on their cravings, dietary restrictions, or budget.
Be concise, friendly, and use emojis.
Always suggest specific items from the available menu data provided in the prompt context.
Prices are in KES (Kenyan Shillings).
If a user asks for something not on the menu, politely suggest the closest alternative.
`;
