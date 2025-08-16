

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCart: (items: Omit<CartItem, 'quantity'>[]) => void;
}

const getCartItemId = (product: Omit<CartItem, 'quantity' | 'id'> & { id: string }) => {
  const optionsIdentifier = (product.selectedOptions && Object.keys(product.selectedOptions).length > 0)
    ? Object.entries(product.selectedOptions).sort().map(([key, value]) => `${key}:${value}`).join('-')
    : '';
  const notesIdentifier = product.notes || '';
  return `${product.id}-${optionsIdentifier}-${notesIdentifier}`;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => {
        const currentItems = get().items;
        const cartItemId = getCartItemId(product);
        const existingItem = currentItems.find((item) => getCartItemId(item) === cartItemId);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              getCartItemId(item) === cartItemId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },
      removeFromCart: (cartItemId: string) => {
        set({
          items: get().items.filter((item) => getCartItemId(item) !== cartItemId),
        });
      },
      updateQuantity: (cartItemId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeFromCart(cartItemId);
        } else {
          set({
            items: get().items.map((item) =>
              getCartItemId(item) === cartItemId ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      setCart: (items) => {
        const itemsWithQuantity = items.map(item => ({...item, quantity: (item as CartItem).quantity || 1}));
        set({ items: itemsWithQuantity });
      },
    }),
    {
      name: 'duo-eats-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
