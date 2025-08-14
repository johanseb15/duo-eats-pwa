
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductCategoryData } from '@/lib/types';
import { notFound } from 'next/navigation';

import CategoryClientPage from './page.client';

const testProducts: Product[] = [
    {
        "id": "p1",
        "name": "Hamburguesa Doble Clásica",
        "description": "Hamburguesa doble carne, queso cheddar, lechuga, tomate y salsa especial en pan artesanal.",
        "price": { "ARS": 1050, "USD": 1.05 },
        "image": "https://images.unsplash.com/photo-1606755962773-0e7c4eecf9b2",
        "aiHint": "classic burger",
        "category": "hamburguesas",
        "stock": 20,
        "options": []
    },
    {
        "id": "p2",
        "name": "Hamburguesa BBQ Bacon",
        "description": "Hamburguesa con queso cheddar, panceta crocante, cebolla caramelizada y salsa BBQ.",
        "price": { "ARS": 1100, "USD": 1.10 },
        "image": "https://images.unsplash.com/photo-1550547660-d9450f859349",
        "aiHint": "bacon burger",
        "category": "hamburguesas",
        "stock": 15,
        "options": []
    },
    {
        "id": "p3",
        "name": "Hamburguesa Veggie",
        "description": "Hamburguesa de lentejas y garbanzos, lechuga, tomate, palta y mayonesa vegana.",
        "price": { "ARS": 1150, "USD": 1.15 },
        "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90",
        "aiHint": "veggie burger",
        "category": "hamburguesas",
        "stock": 10,
        "options": []
    },
    {
        "id": "p4",
        "name": "Hamburguesa Triple Queso",
        "description": "Carne de res, mezcla de quesos cheddar, mozzarella y provolone, con salsa especial.",
        "price": { "ARS": 1200, "USD": 1.20 },
        "image": "https://images.unsplash.com/photo-1599021308365-54c1c2045a8f",
        "aiHint": "triple cheeseburger",
        "category": "hamburguesas",
        "stock": 12,
        "options": []
    },
    {
        "id": "p5",
        "name": "Hamburguesa Spicy Jalapeño",
        "description": "Carne de res, queso cheddar, jalapeños, salsa picante y cebolla morada.",
        "price": { "ARS": 1250, "USD": 1.25 },
        "image": "https://images.unsplash.com/photo-1607013408762-27e03a4d1f3d",
        "aiHint": "spicy burger",
        "category": "hamburguesas",
        "stock": 8,
        "options": []
    },
    {
        "id": "p6",
        "name": "Hamburguesa Criolla",
        "description": "Carne de res, huevo frito, jamón, queso, lechuga, tomate y mayonesa.",
        "price": { "ARS": 1300, "USD": 1.30 },
        "image": "https://images.unsplash.com/photo-1617196039897-1e1dbe1db8ba",
        "aiHint": "creole burger",
        "category": "hamburguesas",
        "stock": 18,
        "options": []
    },
    {
        "id": "p7",
        "name": "Hamburguesa Capresse",
        "description": "Carne de res, mozzarella fresca, tomate, albahaca y pesto.",
        "price": { "ARS": 1350, "USD": 1.35 },
        "image": "https://images.unsplash.com/photo-1594007654729-407eedc4be65",
        "aiHint": "caprese burger",
        "category": "hamburguesas",
        "stock": 14,
        "options": []
    },
    {
        "id": "p8",
        "name": "Hamburguesa Tex-Mex",
        "description": "Carne de res, queso cheddar, guacamole, nachos triturados y salsa mexicana.",
        "price": { "ARS": 1400, "USD": 1.40 },
        "image": "https://images.unsplash.com/photo-1617191519400-bf4ec9079f94",
        "aiHint": "tex-mex burger",
        "category": "hamburguesas",
        "stock": 10,
        "options": []
    },
    {
        "id": "p9",
        "name": "Pizza Napolitana",
        "description": "Pizza tradicional con salsa de tomate, mozzarella fresca, albahaca y aceite de oliva.",
        "price": { "ARS": 1450, "USD": 1.45 },
        "image": "https://images.unsplash.com/photo-1601924582971-df5f0c77b6c1",
        "aiHint": "neapolitan pizza",
        "category": "pizzas",
        "stock": 25,
        "options": []
    },
    {
        "id": "p10",
        "name": "Pizza Muzzarella",
        "description": "Clásica pizza con abundante mozzarella y salsa de tomate artesanal.",
        "price": { "ARS": 1500, "USD": 1.50 },
        "image": "https://images.unsplash.com/photo-1542281286-9e0a16bb7366",
        "aiHint": "mozzarella pizza",
        "category": "pizzas",
        "stock": 30,
        "options": []
    },
];

const testCategories: ProductCategoryData[] = [
  { id: '1', name: 'Hamburguesas', slug: 'hamburguesas', icon: 'Beef' },
  { id: '2', name: 'Pizzas', slug: 'pizzas', icon: 'Pizza' },
  { id: '3', name: 'Lomitos', slug: 'lomitos', icon: 'Sandwich' },
  { id: '4', name: 'Empanadas', slug: 'empanadas', icon: 'Wind' },
  { id: '5', name: 'Bebidas', slug: 'bebidas', icon: 'CupSoda' },
  { id: '6', name: 'Pastas', slug: 'pastas', icon: 'Pasta' },
  { id: '7', name: 'Ensaladas', slug: 'ensaladas', icon: 'Salad' },
  { id: '8', name: 'Postres', slug: 'postres', icon: 'Cake' },
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

    