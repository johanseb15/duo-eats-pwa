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
    },
    {
        id: '2',
        name: 'Pizza Napolitana',
        description: 'Masa fina, salsa de tomate, mozzarella, rodajas de tomate y orégano.',
        price: { ARS: 2800, USD: 2.8 },
        image: 'https://images.unsplash.com/photo-1601924582971-c8b3b4fa6a8a?w=800',
        aiHint: 'neapolitan pizza',
        category: 'pizzas',
        stock: 10,
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
    },
    {
        id: '6',
        name: 'Hamburguesa BBQ',
        description: 'Carne de res, queso cheddar, cebolla frita y salsa barbacoa.',
        price: { ARS: 3300, USD: 3.3 },
        image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13085?w=800',
        aiHint: 'bbq burger',
        category: 'hamburguesas',
        stock: 18,
    },
    {
        id: '7',
        name: 'Pizza Pepperoni',
        description: 'Masa crujiente, salsa de tomate, mozzarella y pepperoni.',
        price: { ARS: 3000, USD: 3.0 },
        image: 'https://images.unsplash.com/photo-1601924994987-69c3b35b4f69?w=800',
        aiHint: 'pepperoni pizza',
        category: 'pizzas',
        stock: 8,
    },
    {
        id: '8',
        name: 'Lomito Simple',
        description: 'Pan baguette, carne vacuna, lechuga, tomate y mayonesa.',
        price: { ARS: 2000, USD: 2.0 },
        image: 'https://images.unsplash.com/photo-1605479085026-2d2a3e3aa87e?w=800',
        aiHint: 'simple lomito',
        category: 'lomitos',
        stock: 25,
    },
    {
        id: '9',
        name: 'Empanadas de Pollo',
        description: 'Empanadas fritas rellenas de pollo y cebolla.',
        price: { ARS: 350, USD: 0.35 },
        image: 'https://images.unsplash.com/photo-1617196036985-fd5f1a9b735e?w=800',
        aiHint: 'chicken empanadas',
        category: 'empanadas',
        stock: 45,
    },
    {
        id: '10',
        name: 'Agua Mineral 500ml',
        description: 'Agua mineral sin gas en botella de 500ml.',
        price: { ARS: 400, USD: 0.4 },
        image: 'https://images.unsplash.com/photo-1599981715701-0f08df5b6d8b?w=800',
        aiHint: 'mineral water',
        category: 'bebidas',
        stock: 120,
    },
    {
        id: '11',
        name: 'Hamburguesa Clásica',
        description: 'Carne de res, lechuga, tomate, cebolla y mayonesa.',
        price: { ARS: 2800, USD: 2.8 },
        image: 'https://images.unsplash.com/photo-1598136490944-bc07f12d3d4a?w=800',
        aiHint: 'classic burger',
        category: 'hamburguesas',
        stock: 20,
    },
    {
        id: '12',
        name: 'Pizza Cuatro Quesos',
        description: 'Mozzarella, gorgonzola, parmesano y provolone.',
        price: { ARS: 3200, USD: 3.2 },
        image: 'https://images.unsplash.com/photo-1603079849119-65e8adba6b60?w=800',
        aiHint: 'four cheese pizza',
        category: 'pizzas',
        stock: 6,
    },
    {
        id: '13',
        name: 'Lomito Vegetariano',
        description: 'Pan integral, hamburguesa de lentejas, lechuga, tomate y palta.',
        price: { ARS: 2200, USD: 2.2 },
        image: 'https://images.unsplash.com/photo-1585238342020-96629b5d1d9d?w=800',
        aiHint: 'vegetarian sandwich',
        category: 'lomitos',
        stock: 15,
    },
    {
        id: '14',
        name: 'Empanadas Caprese',
        description: 'Empanadas rellenas de tomate, mozzarella y albahaca.',
        price: { ARS: 350, USD: 0.35 },
        image: 'https://images.unsplash.com/photo-1625949727792-3a58d5ec6b06?w=800',
        aiHint: 'caprese empanadas',
        category: 'empanadas',
        stock: 40,
    },
    {
        id: '15',
        name: 'Sprite 500ml',
        description: 'Bebida gaseosa sabor lima-limón en botella de 500ml.',
        price: { ARS: 500, USD: 0.5 },
        image: 'https://images.unsplash.com/photo-1597688389271-15f3f41faeef?w=800',
        aiHint: 'sprite bottle',
        category: 'bebidas',
        stock: 90,
    },
    {
        id: '16',
        name: 'Hamburguesa con Huevo',
        description: 'Carne de res, queso cheddar, huevo frito y mayonesa.',
        price: { ARS: 3000, USD: 3.0 },
        image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0f6?w=800',
        aiHint: 'burger with egg',
        category: 'hamburguesas',
        stock: 14,
    },
    {
        id: '17',
        name: 'Pizza Fugazzeta',
        description: 'Masa alta, mozzarella y cebolla.',
        price: { ARS: 2900, USD: 2.9 },
        image: 'https://images.unsplash.com/photo-1617196036985-fd5f1a9b735e?w=800',
        aiHint: 'fugazzeta pizza',
        category: 'pizzas',
        stock: 9,
    },
    {
        id: '18',
        name: 'Lomito Especial',
        description: 'Pan casero, carne, huevo, queso y salsa criolla.',
        price: { ARS: 2600, USD: 2.6 },
        image: 'https://images.unsplash.com/photo-1605479085026-2d2a3e3aa87e?w=800',
        aiHint: 'special lomito',
        category: 'lomitos',
        stock: 18,
    },
    {
        id: '19',
        name: 'Empanadas de Jamón y Queso',
        description: 'Empanadas fritas rellenas de jamón y queso.',
        price: { ARS: 350, USD: 0.35 },
        image: 'https://images.unsplash.com/photo-1625949727792-3a58d5ec6b06?w=800',
        aiHint: 'ham cheese empanadas',
        category: 'empanadas',
        stock: 35,
    },
    {
        id: '20',
        name: 'Fanta 500ml',
        description: 'Bebida gaseosa sabor naranja en botella de 500ml.',
        price: { ARS: 500, USD: 0.5 },
        image: 'https://images.unsplash.com/photo-1626125156777-6c8b7b2e2a9a?w=800',
        aiHint: 'fanta bottle',
        category: 'bebidas',
        stock: 85,
    },
    {
        id: '21',
        name: 'Hamburguesa Doble Bacon',
        description: 'Doble carne de res, queso cheddar y bacon crocante.',
        price: { ARS: 3400, USD: 3.4 },
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
        aiHint: 'double bacon burger',
        category: 'hamburguesas',
        stock: 12,
    },
    {
        id: '22',
        name: 'Pizza Margarita',
        description: 'Masa fina, salsa de tomate, mozzarella y albahaca fresca.',
        price: { ARS: 2800, USD: 2.8 },
        image: 'https://images.unsplash.com/photo-1603079849119-65e8adba6b60?w=800',
        aiHint: 'margarita pizza',
        category: 'pizzas',
        stock: 7,
    },
    {
        id: '23',
        name: 'Lomito BBQ',
        description: 'Pan baguette, carne de res, cebolla caramelizada y salsa BBQ.',
        price: { ARS: 2700, USD: 2.7 },
        image: 'https://images.unsplash.com/photo-1585238342020-96629b5d1d9d?w=800',
        aiHint: 'bbq lomito',
        category: 'lomitos',
        stock: 16,
    },
    {
        id: '24',
        name: 'Empanadas de Verdura',
        description: 'Empanadas al horno rellenas de espinaca y ricotta.',
        price: { ARS: 350, USD: 0.35 },
        image: 'https://images.unsplash.com/photo-1625949727792-3a58d5ec6b06?w=800',
        aiHint: 'vegetable empanadas',
        category: 'empanadas',
        stock: 38,
    },
    {
        id: '25',
        name: 'Agua con Gas 500ml',
        description: 'Agua mineral con gas en botella de 500ml.',
        price: { ARS: 450, USD: 0.45 },
        image: 'https://images.unsplash.com/photo-1599981715701-0f08df5b6d8b?w=800',
        aiHint: 'sparkling water',
        category: 'bebidas',
        stock: 110,
    },
];

async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const q = query(productsCol, where('category', '==', categoryName));
    const productsSnapshot = await getDocs(q);
    
    if (productsSnapshot.empty) {
        // Normalize category name from slug before filtering
        const normalizedCategoryName = categoryName.toLowerCase();
        return testProducts.filter(p => p.category.toLowerCase() === normalizedCategoryName);
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
        options: data.options,
        stock: data.stock || 0,
      } as Product;
    });
    return productList;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryName}, falling back to test data:`, error);
    const normalizedCategoryName = categoryName.toLowerCase();
    return testProducts.filter(p => p.category.toLowerCase() === normalizedCategoryName);
  }
}

async function getCategoryBySlug(slug: string): Promise<ProductCategoryData | null> {
    const testCategories: ProductCategoryData[] = [
      { id: '1', name: 'Hamburguesas', slug: 'hamburguesas', icon: 'Beef' },
      { id: '2', name: 'Pizzas', slug: 'pizzas', icon: 'Pizza' },
      { id: '3', name: 'Lomitos', slug: 'lomitos', icon: 'Sandwich' },
      { id: '4', name: 'Empanadas', slug: 'empanadas', icon: 'Wind' },
      { id: '5', name: 'Bebidas', slug: 'bebidas', icon: 'CupSoda' },
    ];
    
    try {
        const categoriesCol = collection(db, 'categories');
        const q = query(categoriesCol, where('slug', '==', slug));
        const categorySnapshot = await getDocs(q);

        if (!categorySnapshot.empty) {
           const doc = categorySnapshot.docs[0];
           return { id: doc.id, ...doc.data() } as ProductCategoryData;
        }

        return testCategories.find(c => c.slug === slug) || null;

    } catch (error) {
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

  // Use category.name for filtering, as test data uses full names
  const products = await getProductsByCategory(category.name);

  return (
    <CategoryClientPage products={products} category={category} />
  );
}

export const revalidate = 60;
