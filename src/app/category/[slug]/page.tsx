import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductCategoryData } from '@/lib/types';
import { notFound } from 'next/navigation';

import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Frown } from 'lucide-react';
import Link from 'next/link';

async function getProductsByCategory(category: string): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const q = query(productsCol, where('category', '==', category));
  const productsSnapshot = await getDocs(q);
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

async function getCategoryBySlug(slug: string): Promise<ProductCategoryData | null> {
    const categoriesCol = collection(db, 'categories');
    const q = query(categoriesCol, where('slug', '==', slug));
    const categorySnapshot = await getDocs(q);

    if (categorySnapshot.empty) {
        return null;
    }

    const doc = categorySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ProductCategoryData;
}


export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.name);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="relative flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 rounded-full"
            asChild
          >
            <Link href="/">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-center flex-grow">
            {category.name}
          </h1>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Frown className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-semibold">No hay productos aquí</h2>
            <p className="mt-2 text-muted-foreground">
              Parece que aún no hay productos en la categoría "{category.name}".
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

// Revalidate every 60 seconds
export const revalidate = 60;
