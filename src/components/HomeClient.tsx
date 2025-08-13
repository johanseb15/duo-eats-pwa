
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Soup, Beef, GlassWater, IceCream } from 'lucide-react';
import type { Product, ProductCategory, Promotion } from '@/lib/types';

import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import Recommendations from '@/components/Recommendations';
import { PromotionsCarousel } from '@/components/PromotionsCarousel';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeClientProps {
  products: Product[];
  promotions: Promotion[];
}

export default function HomeClient({ products, promotions }: HomeClientProps) {
  const { user, loading: authLoading } = useAuth();
  
  const categories: { name: ProductCategory, icon: React.ElementType, slug: string }[] = [
    { name: 'Entradas', icon: Soup, slug: 'entradas' },
    { name: 'Platos Fuertes', icon: Beef, slug: 'platos-fuertes' },
    { name: 'Bebidas', icon: GlassWater, slug: 'bebidas' },
    { name: 'Postres', icon: IceCream, slug: 'postres' },
  ];
  
  const welcomeName = user ? user.displayName?.split(' ')[0] : 'invitado';

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="text-left mb-8">
           {authLoading ? (
            <Skeleton className="h-9 w-48" />
          ) : (
            <h1 className="text-3xl font-bold text-foreground">
              Hola, {welcomeName} 👋
            </h1>
          )}
          <p className="text-muted-foreground mt-1">
            ¿Qué se te antoja hoy?
          </p>
        </div>

        <section className="mb-12">
           <PromotionsCarousel promotions={promotions} />
         </section>
        
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 text-left">
            Categorías
          </h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            {categories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.name} className="flex flex-col items-center gap-2 group">
                <div className="w-20 h-20 bg-card/80 backdrop-blur-xl rounded-2xl shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <category.icon className="h-9 w-9 text-primary" />
                </div>
                <span className="font-semibold text-foreground text-sm mt-1">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <Recommendations products={products} />

        <section>
          <h2 className="text-xl font-bold mb-4 text-left">
            Menú Completo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
