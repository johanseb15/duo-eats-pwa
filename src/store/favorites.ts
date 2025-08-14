
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/types';

interface FavoritesState {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (product) => {
        const currentFavorites = get().favorites;
        const isAlreadyFavorite = currentFavorites.some((p) => p.id === product.id);

        if (isAlreadyFavorite) {
          // Remove from favorites
          set({
            favorites: currentFavorites.filter((p) => p.id !== product.id),
          });
        } else {
          // Add to favorites
          set({ favorites: [...currentFavorites, product] });
        }
      },
      isFavorite: (productId: string) => {
        return get().favorites.some((p) => p.id === productId);
      },
    }),
    {
      name: 'duo-eats-favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
