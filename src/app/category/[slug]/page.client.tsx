
'use client';

import { useRouter } from 'next/navigation';
import type { Product, ProductCategoryData } from '@/lib/types';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Frown } from 'lucide-react';

interface CategoryClientPageProps {
  products: Product[];
  category: ProductCategoryData;
}

export default function CategoryClientPage({ products, category }: CategoryClientPageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="relative flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 rounded-full"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-6 w-6" />
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
