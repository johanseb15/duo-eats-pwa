
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductCategoryData } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';

import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Frown } from 'lucide-react';
import Link from 'next/link';
import CategoryClientPage from './page.client';

// Added for example data
const testProducts: Product[] = [
    {
        id: '1',
        name: 'Pizza de Muzzarella',
        description: 'Clásica pizza con salsa de tomate, muzzarella y aceitunas.',
        price: { ARS: 10000, USD: 10 },
        image: 'https://placehold.co/400x225.png',
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
        image: 'https://placehold.co/400x225.png',
        aiHint: 'meat empanada',
        category: 'Empanadas',
    },
    {
        id: '3',
        name: 'Flan con Dulce de Leche',
        description: 'Flan casero tradicional con una generosa porción de dulce de leche.',
        price: { ARS: 3000, USD: 3 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'flan caramel',
        category: 'Postres',
    },
    {
        id: '4',
        name: 'Pizza Napolitana',
        description: 'Pizza con salsa de tomate, muzzarella, rodajas de tomate fresco y ajo.',
        price: { ARS: 11000, USD: 11 },
        image: 'https://placehold.co/400x225.png',
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

async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const q = query(productsCol, where('category', '==', categoryName));
    const productsSnapshot = await getDocs(q);
    
    if (!productsSnapshot.empty) {
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
  } catch (error) {
    console.error(`Error fetching products for category ${categoryName}:`, error);
    // Fallback to test data if Firestore errors out
  }
  
  console.log(`Firestore is empty for category ${categoryName} or an error occurred. Returning test data.`);
  return testProducts.filter(p => p.category === categoryName);
}

async function getCategoryBySlug(slug: string): Promise<ProductCategoryData | null> {
    try {
        const categoriesCol = collection(db, 'categories');
        const q = query(categoriesCol, where('slug', '==', slug));
        const categorySnapshot = await getDocs(q);

        if (categorySnapshot.empty) {
            // Fallback for example data
            const testCategories: ProductCategoryData[] = [
              { id: '1', name: 'Pizzas', slug: 'pizzas', icon: 'Pizza' },
              { id: '2', name: 'Empanadas', slug: 'empanadas', icon: 'Wind' },
              { id: '3', name: 'Bebidas', slug: 'bebidas', icon: 'CupSoda' },
              { id: '4', name: 'Postres', slug: 'postres', icon: 'CakeSlice' },
            ];
            return testCategories.find(c => c.slug === slug) || null;
        }

        const doc = categorySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ProductCategoryData;
    } catch (error) {
        console.error(`Error fetching category for slug ${slug}:`, error);
        return null;
    }
}


export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.name);

  return (
    <CategoryClientPage products={products} category={category} />
  );
}

// Revalidate every 60 seconds
export const revalidate = 60;
