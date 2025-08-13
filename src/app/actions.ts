
'use server';

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-recommendations';
import { db } from '@/lib/firebase';
import type { Order, Product, Promotion, ProductCategoryData, DeliveryZone } from '@/lib/types';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';
import { auth } from '@/lib/firebase';


export async function fetchAllUsers() {
    try {
        if (!adminApp) {
          console.log("Admin SDK not initialized. Cannot fetch users.");
          return [];
        }
        const auth = getAuth(adminApp);
        const userRecords = await auth.listUsers();
        return userRecords.users.map(user => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        // This can happen if the backend service account doesn't have permissions
        // Or if the environment variables are not set on the server
        return [];
    }
}


export async function fetchRecommendations() {
  try {
    const currentUser = auth.currentUser;
    let userOrderHistory: string[] = [];
    
    if (currentUser) {
      const userOrders = await fetchOrders(currentUser.uid);
      if (userOrders.length > 0) {
        const productNames = userOrders.flatMap(order => order.items.map(item => item.name));
        userOrderHistory = [...new Set(productNames)]; // Get unique product names
      }
    }

    // If no history, provide a generic one to get some recommendations
    if (userOrderHistory.length === 0) {
      return ['Pizza de Muzzarella', 'Empanadas de Carne', 'Flan con Dulce de Leche'];
    }

    const result = await getPersonalizedRecommendations({
      userOrderHistory: JSON.stringify(userOrderHistory),
      userPreferences: '[]', // Preferences not implemented yet
    });
    return result.recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Fallback recommendations
    return ['Pizza de Muzzarella', 'Empanadas de Carne', 'Flan con Dulce de Leche'];
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
    revalidatePath('/admin/orders');
    revalidatePath('/orders');
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


export async function fetchAllOrders(): Promise<Order[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('createdAt', 'desc'));
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
    console.error("Error fetching all orders: ", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    revalidatePath('/admin/orders');
    revalidatePath('/orders');
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

// Omit 'id' and other read-only fields for creation/updates
export type ProductInput = Omit<Product, 'id' | 'options'>; 

export async function addProduct(productData: ProductInput) {
  try {
    const docRef = await addDoc(collection(db, 'products'), productData);
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true, productId: docRef.id };
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, error: 'Failed to add product' };
  }
}

export async function updateProduct(productId: string, productData: ProductInput) {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, productData);
    revalidatePath('/admin/products');
    revalidatePath(`/product/${productId}`);
    revalidatePath('/');
    revalidatePath('/category', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/category', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}


// Omit 'id' and other read-only fields for creation/updates
export type PromotionInput = Omit<Promotion, 'id'>;

export async function addPromotion(promotionData: PromotionInput) {
  try {
    const docRef = await addDoc(collection(db, 'promotions'), promotionData);
    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true, promotionId: docRef.id };
  } catch (error) {
    console.error('Error adding promotion:', error);
    return { success: false, error: 'Failed to add promotion' };
  }
}

export async function updatePromotion(promotionId: string, promotionData: PromotionInput) {
  try {
    const promotionRef = doc(db, 'promotions', promotionId);
    await updateDoc(promotionRef, promotionData);
    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating promotion:', error);
    return { success: false, error: 'Failed to update promotion' };
  }
}

export async function deletePromotion(promotionId: string) {
  try {
    const promotionRef = doc(db, 'promotions', promotionId);
    await deleteDoc(promotionRef);
    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return { success: false, error: 'Failed to delete promotion' };
  }
}

export type CategoryInput = Omit<ProductCategoryData, 'id'>;

export async function addCategory(categoryData: CategoryInput) {
  try {
    const docRef = await addDoc(collection(db, 'categories'), categoryData);
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true, categoryId: docRef.id };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, error: 'Failed to add category' };
  }
}

export async function updateCategory(categoryId: string, categoryData: CategoryInput) {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, categoryData);
    revalidatePath('/admin/categories');
    revalidatePath('/');
    revalidatePath('/category', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
    revalidatePath('/admin/categories');
    revalidatePath('/');
    revalidatePath('/category', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

export type DeliveryZoneInput = Omit<DeliveryZone, 'id'>;

export async function addDeliveryZone(zoneData: DeliveryZoneInput) {
    try {
        const docRef = await addDoc(collection(db, 'deliveryZones'), zoneData);
        revalidatePath('/admin/delivery-zones');
        revalidatePath('/cart');
        return { success: true, zoneId: docRef.id };
    } catch (error) {
        console.error('Error adding delivery zone:', error);
        return { success: false, error: 'Failed to add delivery zone' };
    }
}

export async function updateDeliveryZone(zoneId: string, zoneData: DeliveryZoneInput) {
    try {
        const zoneRef = doc(db, 'deliveryZones', zoneId);
        await updateDoc(zoneRef, zoneData);
        revalidatePath('/admin/delivery-zones');
        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        console.error('Error updating delivery zone:', error);
        return { success: false, error: 'Failed to update delivery zone' };
    }
}

export async function deleteDeliveryZone(zoneId: string) {
    try {
        const zoneRef = doc(db, 'deliveryZones', zoneId);
        await deleteDoc(zoneRef);
        revalidatePath('/admin/delivery-zones');
        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        console.error('Error deleting delivery zone:', error);
        return { success: false, error: 'Failed to delete delivery zone' };
    }
}
