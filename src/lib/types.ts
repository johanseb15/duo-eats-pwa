

export type Currency = 'ARS' | 'USD';
export type Prices = { [key in Currency]: number };


export interface ProductOptionValue {
  name: string;
  priceModifier: Prices;
}

export interface ProductOption {
  name: string;
  values: ProductOptionValue[];
}

export interface ProductCategoryData {
    id: string;
    name: string;
    slug: string;
    icon: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: Prices;
  image: string;
  aiHint: string;
  category: string; // This should be a category slug
  stock: number;
  options: ProductOption[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedOptions?: { [key: string]: string };
  finalPrice: number;
  notes?: string;
}

export type PaymentMethod = "Efectivo" | "Mercado Pago (QR/Link)" | "Tarjeta (POS)";

export interface Order {
  id: string;
  userId: string | null; // Can be null for guest orders
  userName: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  deliveryCost: number;
  status: 'Pendiente' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado';
  createdAt: string; // ISO 8601 date string
  deliveryDate?: string; // ISO 8601 date string for scheduled orders
  neighborhood?: string;
  address?: string;
  addressDetails?: string;
  cancellationReason?: string;
  paymentMethod: PaymentMethod;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  aiHint: string;
  productId?: string;
}

export interface DeliveryZone {
    id: string;
    neighborhoods: string[];
    cost: number;
}

export interface DeliveryPerson {
    id: string;
    name: string;
    phone: string;
    status: 'active' | 'inactive';
}

// Analytics Types
export interface ProductSale {
  name: string;
  total: number;
}

export interface OrderOverTime {
    date: string;
    orders: number;
}

export interface DashboardAnalytics {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    recentOrders: Order[];
    productSales: ProductSale[];
    ordersOverTime: OrderOverTime[];
}


export interface UserAddress {
  id: string;
  userId: string;
  name: string; // e.g., 'Casa', 'Trabajo'
  fullAddress: string;
  neighborhood: string;
  details?: string; // e.g., 'Apto 5B'
}

export type Day = "lunes" | "martes" | "miércoles" | "jueves" | "viernes" | "sábado" | "domingo";

export interface RestaurantSettings {
    whatsappNumber: string;
    openingTime: string;
    closingTime: string;
    openDays: Day[];
}
