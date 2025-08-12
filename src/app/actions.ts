
'use server';

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-recommendations';
import { db } from '@/lib/firebase';
import type { CartItem, Order } from '@/lib/types';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';

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

export async function fetchOrders(userId: string): Promise<Order[]> {
  if (!userId) {
    return [];
  }
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const ordersSnapshot = await getDocs(q);
    const orderList = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      } as Order;
    });
    return orderList;
  } catch (error) {
    console.error("Error fetching orders: ", error);
    return [];
  }
}
