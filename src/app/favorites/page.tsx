
'use client';

import { useFavorites } from '@/store/favorites';
import { ProductCard } from '@/components/ProductCard';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { EmptyState } from '@/components/ui/empty-state';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const router = useRouter();

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
          <EmptyState
            icon={Heart}
            title="No tienes favoritos"
            description="Toca el corazón en un producto para guardarlo aquí."
            action={{
              label: "Explorar menú",
              onClick: () => router.push('/'),
            }}
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
}
