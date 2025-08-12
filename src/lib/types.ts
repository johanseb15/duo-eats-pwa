
export type Currency = 'PEN' | 'USD';
export type Prices = { [key in Currency]: number };


export interface ProductOptionValue {
  name: string;
  priceModifier: Prices;
}

export interface ProductOption {
  name: string;
  values: ProductOptionValue[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: Prices;
  image: string;
  aiHint: string;
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
