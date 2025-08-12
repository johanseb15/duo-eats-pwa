import type { Product } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Clásica pizza con base de tomate, mozzarella fresca y albahaca.',
    price: 25.99,
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
      {
        name: 'Borde',
        values: [
          { name: 'Normal', priceModifier: 0 },
          { name: 'Queso', priceModifier: 3 },
        ],
      }
    ],
  },
  {
    id: '2',
    name: 'Hamburguesa Clásica',
    description: 'Carne de res, queso cheddar, lechuga, tomate y salsa de la casa.',
    price: 18.99,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'burger cheese',
  },
  {
    id: '3',
    name: 'Ensalada César',
    description: 'Lechuga romana, crutones, queso parmesano y aderezo César.',
    price: 15.5,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'salad bowl',
  },
  {
    id: '4',
    name: 'Pizza Vegetariana',
    description: 'Pimientos, cebolla, champiñones, aceitunas y mozzarella.',
    price: 28.5,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'vegetarian pizza',
  },
  {
    id: '5',
    name: 'Sándwich de Pollo',
    description: 'Pechuga de pollo a la plancha, mayonesa, lechuga y tomate.',
    price: 16.99,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'chicken sandwich',
  },
  {
    id: '6',
    name: 'Pastel de Chocolate',
    description: 'Torta de chocolate húmeda con fudge de chocolate.',
    price: 12.0,
    image: 'https://placehold.co/400x225.png',
    aiHint: 'chocolate cake',
  },
];
