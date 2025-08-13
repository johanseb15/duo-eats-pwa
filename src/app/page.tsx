
import { collection, getDocs, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import HomeClient from '@/components/HomeClient';

const testProducts: Product[] = [
    {
        id: '1',
        name: 'Empanadas de Carne',
        description: 'Jugosas empanadas de carne cortada a cuchillo.',
        price: { ARS: 2500, USD: 2.5 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'empanadas meat',
        category: 'Entradas',
    },
    {
        id: '2',
        name: 'Provoleta a la Parrilla',
        description: 'Queso provolone derretido con orégano y aceite de oliva.',
        price: { ARS: 3500, USD: 3.5 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'provoleta cheese',
        category: 'Entradas',
    },
    {
        id: '3',
        name: 'Pizza de Muzzarella',
        description: 'Clásica pizza con salsa de tomate y abundante muzzarella.',
        price: { ARS: 8000, USD: 8 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'mozzarella pizza',
        category: 'Platos Fuertes',
        options: [
            {
                name: 'Tamaño',
                values: [
                    { name: 'Individual', priceModifier: { ARS: 0, USD: 0 } },
                    { name: 'Grande', priceModifier: { ARS: 1500, USD: 1.5 } },
                ],
            },
        ],
    },
    {
        id: '4',
        name: 'Milanesa a la Napolitana',
        description: 'Tierna milanesa de ternera cubierta con salsa, jamón y queso.',
        price: { ARS: 7500, USD: 7.5 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'milanesa napolitana',
        category: 'Platos Fuertes',
    },
    {
        id: '5',
        name: 'Agua sin Gas',
        description: 'Botella de 500ml de agua mineral natural.',
        price: { ARS: 1500, USD: 1.5 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'water bottle',
        category: 'Bebidas',
    },
    {
        id: '6',
        name: 'Gaseosa Línea Coca-Cola',
        description: 'Lata de 354ml de tu gaseosa favorita.',
        price: { ARS: 2000, USD: 2 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'soda can',
        category: 'Bebidas',
    },
    {
        id: '7',
        name: 'Flan con Dulce de Leche',
        description: 'Postre clásico, flan casero con una generosa porción de dulce de leche.',
        price: { ARS: 3000, USD: 3 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'flan dessert',
        category: 'Postres',
    },
    {
        id: '8',
        name: 'Tiramisú',
        description: 'Cremoso postre italiano con capas de vainillas, café y mascarpone.',
        price: { ARS: 4000, USD: 4 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'tiramisu dessert',
        category: 'Postres',
    },
];

async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const q = firestoreQuery(productsCol, orderBy('name'));
  const productsSnapshot = await getDocs(q);

  // If there are no products in the database, return test data.
  if (productsSnapshot.empty) {
    return testProducts;
  }
  
  const productList = productsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      aiHint: data.aiHint,
      category: data.category,
      options: data.options,
    } as Product;
  });
  return productList;
}

export default async function Home() {
  const products = await getProducts();
  return <HomeClient products={products} />;
}
