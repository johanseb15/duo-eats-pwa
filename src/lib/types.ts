export interface ProductOptionValue {
  name: string;
  priceModifier: number;
}

export interface ProductOption {
  name: string;
  values: ProductOptionValue[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  aiHint: string;
  options?: ProductOption[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedOptions?: { [key: string]: string };
  finalPrice: number;
}
