
'use server';

import { getPersonalizedRecommendations } from '@/ai/flows/personalized-recommendations';
import { suggestCategoryIcon } from '@/ai/flows/suggest-category-icon';
import { db } from '@/lib/firebase';
import type { Order, Product, Promotion, ProductCategoryData, DeliveryZone, DashboardAnalytics, ProductSale, OrderOverTime, CartItem, ProductOption } from '@/lib/types';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, limit, getDoc, runTransaction } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';
import { auth } from '@/lib/firebase';
import { subDays, format } from 'date-fns';


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
        return [];
    }
}


export async function fetchRecommendations() {
  try {
    const currentUser = auth.currentUser;
    let userOrderHistory: string[] = [];
    
    if (currentUser) {
      const userOrders = await fetchOrdersByUserId(currentUser.uid);
      if (userOrders.length > 0) {
        const productNames = userOrders.flatMap(order => order.items.map(item => item.name));
        userOrderHistory = [...new Set(productNames)];
      }
    }

    if (userOrderHistory.length === 0) {
      return ['Pizza de Muzzarella', 'Empanadas de Carne', 'Flan con Dulce de Leche'];
    }

    const result = await getPersonalizedRecommendations({
      userOrderHistory: JSON.stringify(userOrderHistory),
      userPreferences: '[]',
    });
    return result.recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return ['Pizza de Muzzarella', 'Empanadas de Carne', 'Flan con Dulce de Leche'];
  }
}

export async function generateIconSuggestion(categoryName: string): Promise<string> {
    try {
        const result = await suggestCategoryIcon({ categoryName });
        return result.iconName;
    } catch (error) {
        console.error('Error suggesting icon:', error);
        return 'Package';
    }
}


interface CreateOrderInput {
  userId?: string; // Optional for guest checkouts
  userName: string;
  items: CartItem[];
  total: number;
  deliveryCost: number;
  subtotal: number;
  deliveryDate?: string; // Optional for scheduled orders
  neighborhood?: string;
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const orderData = {
      ...input,
      userId: input.userId || null, // Store null if it's a guest
      status: 'Pendiente',
      createdAt: serverTimestamp(),
      deliveryDate: input.deliveryDate || null,
      neighborhood: input.neighborhood || null,
    };
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    // Decrement stock for each item in the order
    await runTransaction(db, async (transaction) => {
        for (const item of input.items) {
            if (item.stock === undefined || item.stock === null) continue; // Skip stock update if not defined
            
            const productRef = doc(db, 'products', item.id);
            const productDoc = await transaction.get(productRef);

            if (!productDoc.exists()) {
                throw new Error(`Product with ID ${item.id} not found!`);
            }
            
            const currentStock = productDoc.data().stock;
            // Only decrement if stock is a number and defined
            if (typeof currentStock === 'number') {
                const newStock = currentStock - item.quantity;
                if (newStock < 0) {
                    // This could happen in a race condition.
                    // Decide how to handle it: throw an error to fail the transaction,
                    // or just set stock to 0. Failing is safer.
                    throw new Error(`Not enough stock for product ${item.name}.`);
                }
                transaction.update(productRef, { stock: newStock });
            }
        }
    });

    revalidatePath('/admin/orders');
    revalidatePath('/orders');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/');

    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

export async function fetchOrdersByUserId(userId: string): Promise<Order[]> {
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

export async function fetchOrderById(orderId: string): Promise<Order | null> {
    if (!orderId) {
        return null;
    }
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return null;
        }
        
        const data = orderSnap.data();
        return {
            id: orderSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as Order;

    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return null;
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
    revalidatePath('/admin');
    revalidatePath(`/order/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export type ProductInput = Omit<Product, 'id'>; 

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

export async function updateProduct(productId: string, productData: Partial<ProductInput>) {
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

// Analytics Actions
export async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
        const allOrders = await fetchAllOrders();
        const deliveredOrders = allOrders.filter(o => o.status === 'Entregado');
        
        const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = allOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / deliveredOrders.length : 0;
        
        const recentOrders = allOrders.slice(0, 5);

        // Product Sales
        const sales: { [key: string]: number } = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                sales[item.name] = (sales[item.name] || 0) + item.quantity;
            });
        });
        const productSales: ProductSale[] = Object.entries(sales)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - b.total)
            .slice(0, 5);

        // Orders over time (last 7 days)
        const ordersByDate: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
            const date = format(subDays(new Date(), i), 'MMM d');
            ordersByDate[date] = 0;
        }

        allOrders.forEach(order => {
            const date = format(new Date(order.createdAt), 'MMM d');
            if (date in ordersByDate) {
                ordersByDate[date]++;
            }
        });
        const ordersOverTime: OrderOverTime[] = Object.entries(ordersByDate)
            .map(([date, orders]) => ({ date, orders }));

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            recentOrders,
            productSales,
            ordersOverTime
        };

    } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            recentOrders: [],
            productSales: [],
            ordersOverTime: []
        };
    }
}
