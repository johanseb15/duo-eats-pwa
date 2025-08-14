
'use client';

import { useFavorites } from '@/store/favorites';
import { ProductCard } from '@/components/ProductCard';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Mis Favoritos</h1>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-semibold">No tienes favoritos</h2>
            <p className="mt-2 text-muted-foreground">
              Toca el corazón en un producto para guardarlo aquí.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/">Explorar menú</Link>
            </Button>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
