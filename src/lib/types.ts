

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

export type ProductCategory = 'Entradas' | 'Platos Fuertes' | 'Bebidas' | 'Postres';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: Prices;
  image: string;
  aiHint: string;
  category: ProductCategory;
  options?: ProductOption[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedOptions?: { [key: string]: string };
  finalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  deliveryCost: number;
  status: 'Pendiente' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado';
  createdAt: string; // ISO 8601 date string
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  aiHint: string;
}

