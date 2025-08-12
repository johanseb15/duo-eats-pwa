import type { Product } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic delight with 100% real mozzarella cheese',
    price: 12.99,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'pizza cheese',
    options: [
      {
        name: 'Tamaño',
        values: [
          { name: 'Personal', priceModifier: 0 },
          { name: 'Mediana', priceModifier: 5 },
          { name: 'Familiar', priceModifier: 10 },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Cheeseburger',
    description: 'A signature flame-grilled beef patty topped with a simple layer of melted American cheese.',
    price: 8.99,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'burger cheese',
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine tossed with croutons, Caesar dressing, and grated cheese.',
    price: 7.5,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'salad bowl',
  },
  {
    id: '4',
    name: 'Veggie Supreme',
    description: 'A garden-fresh delight with a mix of colorful vegetables and melting cheese.',
    price: 14.5,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'vegetarian pizza',
  },
  {
    id: '5',
    name: 'Spicy Chicken Burger',
    description: 'Crispy seasoned chicken breast, topped with mandatory melted cheese and piled onto a soft roll.',
    price: 9.99,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'chicken burger',
  },
  {
    id: '6',
    name: 'Chocolate Lava Cake',
    description: 'Indulgent chocolate cake with a molten chocolate center.',
    price: 6.0,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'chocolate cake',
  },
];
