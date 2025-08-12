export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  aiHint: string;
  options?: {
    name: string;
    values: string[];
  }[];
}

export interface CartItem extends Product {
  quantity: number;
}
