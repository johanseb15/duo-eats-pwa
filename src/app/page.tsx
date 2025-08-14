
import { collection, getDocs, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Promotion, ProductCategoryData } from '@/lib/types';
import HomeClient from '@/components/HomeClient';

const testProducts: Product[] = [
    {
        id: '1',
        name: 'Hamburguesa Doble Queso',
        description: 'Doble carne de res, queso cheddar, cebolla caramelizada y salsa especial.',
        price: { ARS: 3200, USD: 3.2 },
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
        aiHint: 'double cheeseburger',
        category: 'hamburguesas',
        stock: 15,
        options: []
    },
    {
        id: '2',
        name: 'Pizza de Muzzarella',
        description: 'Masa fina, salsa de tomate, y la mejor muzzarella.',
        price: { ARS: 2800, USD: 2.8 },
        image: 'https://images.unsplash.com/photo-1601924582971-c8b3b4fa6a8a?w=800',
        aiHint: 'neapolitan pizza',
        category: 'pizzas',
        stock: 10,
        options: [
            {
                name: 'Tamaño',
                values: [
                    { name: 'Individual', priceModifier: { ARS: 0, USD: 0 } },
                    { name: 'Mediana', priceModifier: { ARS: 800, USD: 0.8 } },
                    { name: 'Grande', priceModifier: { ARS: 1500, USD: 1.5 } },
                ],
            },
            {
                name: 'Masa',
                values: [
                    { name: 'A la Piedra', priceModifier: { ARS: 0, USD: 0 } },
                    { name: 'Media Masa', priceModifier: { ARS: 200, USD: 0.2 } },
                ],
            },
        ]
    },
    {
        id: '3',
        name: 'Lomito Completo',
        description: 'Pan casero, carne vacuna, lechuga, tomate, jamón, queso, huevo y mayonesa.',
        price: { ARS: 2500, USD: 2.5 },
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800',
        aiHint: 'lomito sandwich',
        category: 'lomitos',
        stock: 20,
        options: []
    },
    {
        id: '4',
        name: 'Empanadas de Carne',
        description: 'Empanadas al horno rellenas de carne, cebolla y especias.',
        price: { ARS: 350, USD: 0.35 },
        image: 'https://images.unsplash.com/photo-1604908177522-4327d4d1d2d2?w=800',
        aiHint: 'meat empanadas',
        category: 'empanadas',
        stock: 50,
        options: []
    },
    {
        id: '5',
        name: 'Coca-Cola 500ml',
        description: 'Bebida gaseosa sabor cola en botella de 500ml.',
        price: { ARS: 500, USD: 0.5 },
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8752b?w=800',
        aiHint: 'coca-cola bottle',
        category: 'bebidas',
        stock: 100,
        options: []
    },
];

const testCategories: ProductCategoryData[] = [
  { id: '1', name: 'Hamburguesas', slug: 'hamburguesas', icon: 'Beef' },
  { id: '2', name: 'Pizzas', slug: 'pizzas', icon: 'Pizza' },
  { id: '3', name: 'Lomitos', slug: 'lomitos', icon: 'Sandwich' },
  { id: '4', name: 'Empanadas', slug: 'empanadas', icon: 'Wind' },
  { id: '5', name: 'Bebidas', slug: 'bebidas', icon: 'CupSoda' },
];

const testPromotions: Promotion[] = [
  {
    id: '1',
    title: '¡Combo Hamburguesa!',
    description: 'Hamburguesa Doble Queso + Coca-Cola 500ml a precio especial.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
    aiHint: 'burger combo',
  },
   {
    id: '2',
    title: '¡Promo Pizza!',
    description: 'Llevando 2 Pizzas Napolitanas, la segunda tiene 50% OFF.',
    image: 'https://images.unsplash.com/photo-1601924582971-c8b3b4fa6a8a?w=800',
    aiHint: 'pizza offer',
  },
];


async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const q = firestoreQuery(productsCol, orderBy('name'));
    const productsSnapshot = await getDocs(q);
    
    if (productsSnapshot.empty) {
        console.log("No products found in Firestore, using test data.");
        return testProducts;
    }
    
    const productList = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        aiHint: data.aiHint,
        category: data.category,
        options: data.options || [],
        stock: data.stock || 0,
      } as Product;
    });
    return productList;
  } catch (error) {
    console.error("Error fetching products, falling back to test data:", error);
    return testProducts;
  }
}

async function getPromotions(): Promise<Promotion[]> {
    try {
      const promotionsCol = collection(db, 'promotions');
      const promotionsSnapshot = await getDocs(promotionsCol);
      
      if (promotionsSnapshot.empty) {
        console.log("No promotions found in Firestore, using test data.");
        return testPromotions;
      }

      const promotionList = promotionsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              title: data.title,
              description: data.description,
              image: data.image,
              aiHint: data.aiHint,
          } as Promotion;
      });
      return promotionList;
    } catch (error) {
      console.error("Error fetching promotions, falling back to test data:", error);
      return testPromotions;
    }
}

async function getCategories(): Promise<ProductCategoryData[]> {
    try {
      const categoriesCol = collection(db, 'categories');
      const q = firestoreQuery(categoriesCol, orderBy('name'));
      const categoriesSnapshot = await getDocs(q);

      if (categoriesSnapshot.empty) {
        console.log("No categories found in Firestore, using test data.");
        return testCategories;
      }

      const categoryList = categoriesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              name: data.name,
              slug: data.slug,
              icon: data.icon || 'Package',
          } as ProductCategoryData;
      });
      return categoryList;
    } catch (error) {
      console.error("Error fetching categories, falling back to test data:", error);
      return testCategories;
    }
}


export default async function Home() {
  const products = await getProducts();
  const promotions = await getPromotions();
  const categories = await getCategories();
  
  return <HomeClient products={products} promotions={promotions} categories={categories} />;
}

    