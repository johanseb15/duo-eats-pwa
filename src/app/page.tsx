
import { collection, getDocs, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Promotion, ProductCategoryData } from '@/lib/types';
import HomeClient from '@/components/HomeClient';

const testProducts: Product[] = [
    {
        id: '1',
        name: 'Pizza de Muzzarella',
        description: 'Clásica pizza con salsa de tomate, muzzarella y aceitunas.',
        price: { ARS: 10000, USD: 10 },
        image: 'https://placehold.co/600x400.png',
        aiHint: 'mozzarella pizza',
        category: 'Pizzas',
        options: [
            {
                name: 'Tamaño',
                values: [
                    { name: 'Individual', priceModifier: { ARS: 0, USD: 0 } },
                    { name: 'Grande', priceModifier: { ARS: 2000, USD: 2 } },
                ],
            },
            {
                name: 'Borde',
                values: [
                    { name: 'Normal', priceModifier: { ARS: 0, USD: 0 } },
                    { name: 'Relleno de Queso', priceModifier: { ARS: 1500, USD: 1.5 } },
                ],
            }
        ]
    },
    {
        id: '2',
        name: 'Empanadas de Carne',
        description: 'Empanadas jugosas de carne cortada a cuchillo.',
        price: { ARS: 1000, USD: 1 },
        image: 'https://placehold.co/600x400.png',
        aiHint: 'meat empanada',
        category: 'Empanadas',
    },
    {
        id: '3',
        name: 'Flan con Dulce de Leche',
        description: 'Flan casero tradicional con una generosa porción de dulce de leche.',
        price: { ARS: 3000, USD: 3 },
        image: 'https://placehold.co/600x400.png',
        aiHint: 'flan caramel',
        category: 'Postres',
    },
     {
        id: '4',
        name: 'Pizza Napolitana',
        description: 'Pizza con salsa de tomate, muzzarella, rodajas de tomate fresco y ajo.',
        price: { ARS: 11000, USD: 11 },
        image: 'https://placehold.co/600x400.png',
        aiHint: 'neapolitan pizza',
        category: 'Pizzas',
         options: [
            {
                name: 'Tamaño',
                values: [
                    { name: 'Individual', priceModifier: { ARS: 0, USD: 0 } },
                    { name: 'Grande', priceModifier: { ARS: 2200, USD: 2.2 } },
                ],
            }
        ]
    },
];

const testCategories: ProductCategoryData[] = [
  { id: '1', name: 'Pizzas', slug: 'pizzas', icon: 'Pizza' },
  { id: '2', name: 'Empanadas', slug: 'empanadas', icon: 'Wind' },
  { id: '3', name: 'Bebidas', slug: 'bebidas', icon: 'CupSoda' },
  { id: '4', name: 'Postres', slug: 'postres', icon: 'CakeSlice' },
];

const testPromotions: Promotion[] = [
  {
    id: '1',
    title: '¡Dúo Dinámico!',
    description: '2 Pizzas de Muzzarella por un precio especial.',
    image: 'https://placehold.co/150x150.png',
    aiHint: 'pizza promo',
  },
   {
    id: '2',
    title: '¡Martes de Empanadas!',
    description: '12 empanadas a elección con 10% de descuento.',
    image: 'https://placehold.co/150x150.png',
    aiHint: 'empanadas offer',
  },
];


async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const q = firestoreQuery(productsCol, orderBy('name'));
    const productsSnapshot = await getDocs(q);
    
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
  } catch (error) {
    console.error("Error fetching products, falling back to test data:", error);
    return testProducts;
  }
}

async function getPromotions(): Promise<Promotion[]> {
    try {
      const promotionsCol = collection(db, 'promotions');
      const promotionsSnapshot = await getDocs(promotionsCol);
      
      if (promotionsSnapshot.empty) {
        return testPromotions;
      }

      const promotionList = promotionsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              title: data.title,
              description: data.description,
              image: data.image,
              aiHint: data.aiHint,
          } as Promotion;
      });
      return promotionList;
    } catch (error) {
      console.error("Error fetching promotions, falling back to test data:", error);
      return testPromotions;
    }
}

async function getCategories(): Promise<ProductCategoryData[]> {
    try {
      const categoriesCol = collection(db, 'categories');
      const q = firestoreQuery(categoriesCol, orderBy('name'));
      const categoriesSnapshot = await getDocs(q);

      if (categoriesSnapshot.empty) {
        return testCategories;
      }

      const categoryList = categoriesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              name: data.name,
              slug: data.slug,
              icon: data.icon || 'Package',
          } as ProductCategoryData;
      });
      return categoryList;
    } catch (error) {
      console.error("Error fetching categories, falling back to test data:", error);
      return testCategories;
    }
}


export default async function Home() {
  const products = await getProducts();
  const promotions = await getPromotions();
  const categories = await getCategories();
  
  return <HomeClient products={products} promotions={promotions} categories={categories} />;
}
