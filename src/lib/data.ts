import type { Product } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Clásica pizza con base de tomate, mozzarella fresca y albahaca.',
    price: { PEN: 25.99, USD: 7.99 },
    image: 'https://placehold.co/400x225.png',
    aiHint: 'pizza cheese',
    options: [
      {
        name: 'Tamaño',
        values: [
          { name: 'Personal', priceModifier: { PEN: 0, USD: 0 } },
          { name: 'Mediana', priceModifier: { PEN: 5, USD: 1.5 } },
          { name: 'Familiar', priceModifier: { PEN: 10, USD: 3 } },
        ],
      },
      {
        name: 'Borde',
        values: [
          { name: 'Normal', priceModifier: { PEN: 0, USD: 0 } },
          { name: 'Queso', priceModifier: { PEN: 3, USD: 1 } },
        ],
      }
    ],
  },
  {
    id: '2',
    name: 'Hamburguesa Clásica',
    description: 'Carne de res, queso cheddar, lechuga, tomate y salsa de la casa.',
    price: { PEN: 18.99, USD: 5.50 },
    image: 'https://placehold.co/400x225.png',
    aiHint: 'burger cheese',
  },
  {
    id: '3',
    name: 'Ensalada César',
    description: 'Lechuga romana, crutones, queso parmesano y aderezo César.',
    price: { PEN: 15.5, USD: 4.50 },
    image: 'https://placehold.co/400x225.png',
    aiHint: 'salad bowl',
  },
  {
    id: '4',
    name: 'Pizza Vegetariana',
    description: 'Pimientos, cebolla, champiñones, aceitunas y mozzarella.',
    price: { PEN: 28.5, USD: 8.50 },
    image: 'https://placehold.co/400x225.png',
    aiHint: 'vegetarian pizza',
  },
  {
    id: '5',
    name: 'Sándwich de Pollo',
    description: 'Pechuga de pollo a la plancha, mayonesa, lechuga y tomate.',
    price: { PEN: 16.99, USD: 4.99 },
    image: 'https://placehold.co/400x225.png',
    aiHint: 'chicken sandwich',
  },
  {
    id: '6',
    name: 'Pastel de Chocolate',
    description: 'Torta de chocolate húmeda con fudge de chocolate.',
    price: { PEN: 12.0, USD: 3.50 },
    image: 'https://placehold.co/400x225.png',
    aiHint: 'chocolate cake',
  },
];
