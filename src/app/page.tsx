
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Soup, Beef, GlassWater, IceCream } from 'lucide-react';
import { collection, getDocs, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductCategory } from '@/lib/types';

import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import Recommendations from '@/components/Recommendations';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


const testProducts: Product[] = [
    {
        id: '1',
        name: 'Empanadas de Carne',
        description: 'Jugosas empanadas de carne cortada a cuchillo.',
        price: { ARS: 2500, USD: 2.5 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'empanadas meat',
        category: 'Entradas',
    },
    {
        id: '2',
        name: 'Provoleta a la Parrilla',
        description: 'Queso provolone derretido con orégano y aceite de oliva.',
        price: { ARS: 3500, USD: 3.5 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'provoleta cheese',
        category: 'Entradas',
    },
    {
        id: '3',
        name: 'Pizza de Muzzarella',
        description: 'Clásica pizza con salsa de tomate y abundante muzzarella.',
        price: { ARS: 8000, USD: 8 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'mozzarella pizza',
        category: 'Platos Fuertes',
        options: [
            {
                name: 'Tamaño',
                values: [
                    { name: 'Individual', priceModifier: { ARS: 0, USD: 0 } },
                    { name: 'Grande', priceModifier: { ARS: 1500, USD: 1.5 } },
                ],
            },
        ],
    },
    {
        id: '4',
        name: 'Milanesa a la Napolitana',
        description: 'Tierna milanesa de ternera cubierta con salsa, jamón y queso.',
        price: { ARS: 7500, USD: 7.5 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'milanesa napolitana',
        category: 'Platos Fuertes',
    },
    {
        id: '5',
        name: 'Agua sin Gas',
        description: 'Botella de 500ml de agua mineral natural.',
        price: { ARS: 1500, USD: 1.5 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'water bottle',
        category: 'Bebidas',
    },
    {
        id: '6',
        name: 'Gaseosa Línea Coca-Cola',
        description: 'Lata de 354ml de tu gaseosa favorita.',
        price: { ARS: 2000, USD: 2 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'soda can',
        category: 'Bebidas',
    },
    {
        id: '7',
        name: 'Flan con Dulce de Leche',
        description: 'Postre clásico, flan casero con una generosa porción de dulce de leche.',
        price: { ARS: 3000, USD: 3 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'flan dessert',
        category: 'Postres',
    },
    {
        id: '8',
        name: 'Tiramisú',
        description: 'Cremoso postre italiano con capas de vainillas, café y mascarpone.',
        price: { ARS: 4000, USD: 4 },
        image: 'https://placehold.co/400x225.png',
        aiHint: 'tiramisu dessert',
        category: 'Postres',
    },
];

async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const q = firestoreQuery(productsCol, orderBy('name'));
  const productsSnapshot = await getDocs(q);

  // If there are no products in the database, return test data.
  if (productsSnapshot.empty) {
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
      options: data.options,
    } as Product;
  });
  return productList;
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const categories: { name: ProductCategory, icon: React.ElementType, slug: string }[] = [
    { name: 'Entradas', icon: Soup, slug: 'entradas' },
    { name: 'Platos Fuertes', icon: Beef, slug: 'platos-fuertes' },
    { name: 'Bebidas', icon: GlassWater, slug: 'bebidas' },
    { name: 'Postres', icon: IceCream, slug: 'postres' },
  ];
  
  const welcomeName = user ? user.displayName?.split(' ')[0] : 'invitado';


  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="text-left mb-8">
           {authLoading ? (
            <Skeleton className="h-9 w-48" />
          ) : (
            <h1 className="text-3xl font-bold text-foreground">
              Hola, {welcomeName} 👋
            </h1>
          )}
          <p className="text-muted-foreground mt-1">
            ¿Qué se te antoja hoy?
          </p>
        </div>

        <section className="mb-12">
           <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-primary to-blue-400">
             <CardContent className="relative flex items-center justify-between p-6">
               <div className="text-white">
                 <h2 className="text-2xl font-bold">¡Dúo Dinámico!</h2>
                 <p className="text-sm">2 Pizzas Medianas por $ 8000</p>
               </div>
                <Image
                  src="https://placehold.co/100x100.png"
                  alt="Promo"
                  width={80}
                  height={80}
                  className="rounded-full"
                  data-ai-hint="pizza promo"
                />
             </CardContent>
           </Card>
         </section>
        
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 text-left">
            Categorías
          </h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            {categories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.name} className="flex flex-col items-center gap-2 group">
                <div className="w-20 h-20 bg-card/80 backdrop-blur-xl rounded-2xl shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <category.icon className="h-9 w-9 text-primary" />
                </div>
                <span className="font-semibold text-foreground text-sm mt-1">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <Recommendations />

        <section>
          <h2 className="text-xl font-bold mb-4 text-left">
            Menú Completo
          </h2>
           {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-72 w-full rounded-3xl" />
                <Skeleton className="h-72 w-full rounded-3xl" />
                <Skeleton className="h-72 w-full rounded-3xl" />
             </div>
           ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
           )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
