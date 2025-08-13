
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product, ProductCategoryData, Promotion } from '@/lib/types';
import * as LucideIcons from 'lucide-react';

import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import Recommendations from '@/components/Recommendations';
import { PromotionsCarousel } from '@/components/PromotionsCarousel';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';
import { FileText, PlusCircle } from 'lucide-react';

interface HomeClientProps {
  products: Product[];
  promotions: Promotion[];
  categories: ProductCategoryData[];
}

export default function HomeClient({ products, promotions, categories }: HomeClientProps) {
  const { user, loading: authLoading } = useAuth();
  
  const welcomeName = user ? user.displayName?.split(' ')[0] : 'invitado';

  const getIcon = (name: string): React.ElementType => {
    return (LucideIcons as any)[name] || LucideIcons.Package;
  };


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
          {categories.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 text-center">
              {categories.map((category) => {
                  const Icon = getIcon(category.icon);
                  return (
                    <Link href={`/category/${category.slug}`} key={category.id} className="flex flex-col items-center gap-2 group">
                      <div className="w-20 h-20 bg-card/80 backdrop-blur-xl rounded-2xl shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-9 w-9 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground text-sm mt-1">{category.name}</span>
                    </Link>
                  )
              })}
            </div>
          ) : (
             <div className="text-center py-10 bg-card/60 backdrop-blur-xl rounded-2xl">
                <h3 className="text-lg font-semibold">No hay categorías</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Añade algunas desde el panel de administrador para empezar.
                </p>
              </div>
          )}
        </section>

        <Recommendations products={products} />

        <section>
          <h2 className="text-xl font-bold mb-4 text-left">
            Menú Completo
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-card/60 backdrop-blur-xl rounded-2xl">
              <FileText className="mx-auto h-24 w-24 text-muted-foreground" />
              <h2 className="mt-6 text-2xl font-semibold">Nuestro menú está vacío</h2>
              <p className="mt-2 text-muted-foreground">
                Parece que aún no has añadido ningún producto.
              </p>
              {user && ( // Only show button if user is logged in
                <Button asChild className="mt-6 rounded-full">
                  <Link href="/admin/products"><PlusCircle className='mr-2'/>Añadir Productos</Link>
                </Button>
              )}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
