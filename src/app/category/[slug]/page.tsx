
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductCategoryData } from '@/lib/types';
import { notFound } from 'next/navigation';

import CategoryClientPage from './page.client';

async function getDataForCategoryPage(slug: string): Promise<{ products: Product[]; category: ProductCategoryData | null }> {
  let category: ProductCategoryData | null = null;
  let products: Product[] = [];

  try {
    // 1. Fetch the category by slug
    const categoriesCol = collection(db, 'categories');
    const categoryQuery = query(categoriesCol, where('slug', '==', slug));
    const categorySnapshot = await getDocs(categoryQuery);

    if (categorySnapshot.empty) {
      console.warn(`No category found in Firestore for slug: ${slug}`);
      return { products: [], category: null };
    }
    
    const categoryDoc = categorySnapshot.docs[0];
    category = { id: categoryDoc.id, ...categoryDoc.data() } as ProductCategoryData;

    // 2. Fetch products for that category
    const productsCol = collection(db, 'products');
    const productsQuery = query(productsCol, where('category', '==', category.slug));
    const productsSnapshot = await getDocs(productsQuery);

    if (!productsSnapshot.empty) {
      products = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image,
          aiHint: data.aiHint,
          category: data.category,
          options: data.options || [],
          stock: data.stock === undefined ? 10 : data.stock, // Default stock
        } as Product;
      });
    }

    return { products, category };

  } catch (error) {
    console.error(`Error fetching data for category page (slug: ${slug}):`, error);
    // On error, return empty state to avoid crashing
    return { products: [], category: null };
  }
}


export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { products, category } = await getDataForCategoryPage(slug);

  if (!category) {
    notFound();
  }

  return (
    <CategoryClientPage products={products} category={category} />
  );
}

export const revalidate = 60; // Revalidate data every 60 seconds
    