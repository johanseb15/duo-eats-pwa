
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductCategoryData } from '@/lib/types';
import { notFound } from 'next/navigation';

import CategoryClientPage from './page.client';

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
     {
        id: '6',
        name: 'Pizza Pepperoni',
        description: 'Masa crujiente, salsa de tomate, mozzarella y pepperoni.',
        price: { ARS: 3000, USD: 3.0 },
        image: 'https://images.unsplash.com/photo-1601924994987-69c3b35b4f69?w=800',
        aiHint: 'pepperoni pizza',
        category: 'pizzas',
        stock: 8,
        options: []
    },
     {
        id: '7',
        name: 'Pizza Cuatro Quesos',
        description: 'Mozzarella, gorgonzola, parmesano y provolone.',
        price: { ARS: 3200, USD: 3.2 },
        image: 'https://images.unsplash.com/photo-1603079849119-65e8adba6b60?w=800',
        aiHint: 'four cheese pizza',
        category: 'pizzas',
        stock: 6,
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

async function getProductsByCategorySlug(categorySlug: string): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    // We assume the category field in a product document stores the slug.
    const q = query(productsCol, where('category', '==', categorySlug));
    const productsSnapshot = await getDocs(q);
    
    if (productsSnapshot.empty) {
        console.log(`No products found in Firestore for category ${categorySlug}, using test data.`);
        return testProducts.filter(p => p.category === categorySlug);
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
    console.error(`Error fetching products for category slug ${categorySlug}, falling back to test data:`, error);
    return testProducts.filter(p => p.category === categorySlug);
  }
}

async function getCategoryBySlug(slug: string): Promise<ProductCategoryData | null> {
    try {
        const categoriesCol = collection(db, 'categories');
        const q = query(categoriesCol, where('slug', '==', slug));
        const categorySnapshot = await getDocs(q);

        if (!categorySnapshot.empty) {
           const doc = categorySnapshot.docs[0];
           return { id: doc.id, ...doc.data() } as ProductCategoryData;
        }

        // Fallback to test data if Firestore is empty
        console.log(`No category found in Firestore for slug ${slug}, using test data.`);
        return testCategories.find(c => c.slug === slug) || null;
    } catch (error) {
        // Fallback to test data on any Firestore error
        console.error(`Error fetching category for slug '${slug}', falling back to test data:`, error);
        return testCategories.find(c => c.slug === slug) || null;
    }
}


export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Use category.slug for filtering, which is more reliable.
  const products = await getProductsByCategorySlug(category.slug);

  return (
    <CategoryClientPage products={products} category={category} />
  );
}

export const revalidate = 60;
