
import Link from 'next/link';
import Image from 'next/image';
import { Soup, Beef, GlassWater, IceCream } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';

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

async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productsSnapshot = await getDocs(productsCol);
  const productList = productsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      aiHint: data.aiHint,
      options: data.options,
    } as Product;
  });
  return productList;
}

export default async function Home() {
  const products = await getProducts();
  
  const categories = [
    { name: 'Entradas', icon: Soup },
    { name: 'Platos Fuertes', icon: Beef },
    { name: 'Bebidas', icon: GlassWater },
    { name: 'Postres', icon: IceCream },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Hola, Johan 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            ¿Qué se te antoja hoy?
          </p>
        </div>

        <section className="mb-12">
           <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-primary to-blue-400">
             <CardContent className="relative flex items-center justify-between p-6">
               <div className="text-white">
                 <h2 className="text-2xl font-bold">¡Dúo Dinámico!</h2>
                 <p className="text-sm">2 Pizzas Medianas por S/ 49.90</p>
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
              <Link href="#" key={category.name} className="flex flex-col items-center gap-2 group">
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
            Más Populares
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
