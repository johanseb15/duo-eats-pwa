
'use server';

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-recommendations';
import { db } from '@/lib/firebase';
import type { CartItem } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function fetchRecommendations() {
  try {
    const result = await getPersonalizedRecommendations({
      userOrderHistory: '["Pizza", "Coke"]',
      userPreferences: '["Spicy", "Vegetarian"]',
    });
    return result.recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Fallback recommendations
    return ['Spicy Veggie Pizza', 'Chilli Paneer', 'Gobi Manchurian'];
  }
}

interface CreateOrderInput {
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  deliveryCost: number;
  subtotal: number;
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const orderData = {
      ...input,
      status: 'Pendiente',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}
