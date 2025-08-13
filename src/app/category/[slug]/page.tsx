
'use client';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductCategory } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Frown } from 'lucide-react';

const categoryMap: Record<string, ProductCategory> = {
  'entradas': 'Entradas',
  'platos-fuertes': 'Platos Fuertes',
  'bebidas': 'Bebidas',
  'postres': 'Postres',
};

async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
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

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const categoryName = categoryMap[slug];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryName) {
      const fetchProducts = async () => {
        setLoading(true);
        const fetchedProducts = await getProductsByCategory(categoryName);
        setProducts(fetchedProducts);
        setLoading(false);
      };
      fetchProducts();
    } else {
        setLoading(false);
    }
  }, [categoryName]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="relative flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 rounded-full"
            onClick={() => router.push('/')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-center flex-grow">
            {categoryName || 'Categoría no encontrada'}
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-72 w-full rounded-3xl" />
            <Skeleton className="h-72 w-full rounded-3xl" />
            <Skeleton className="h-72 w-full rounded-3xl" />
          </div>
        ) : products.length > 0 ? (
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
              Parece que aún no hay productos en la categoría "{categoryName}".
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
