import Link from 'next/link';
import Image from 'next/image';
import { Soup, Beef, GlassWater, IceCream2 } from 'lucide-react';

import { products } from '@/lib/data';
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

export default function Home() {
  const categories = [
    { name: 'Sopas', icon: Soup },
    { name: 'Carnes', icon: Beef },
    { name: 'Bebidas', icon: GlassWater },
    { name: 'Postres', icon: IceCream2 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="text-left mb-8">
          <h1 className="font-headline text-4xl font-bold text-foreground">
            Hola, Johan 🍕
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            ¿Qué vas a comer hoy?
          </p>
        </div>

        <section className="mb-12">
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-primary to-accent">
            <CardContent className="relative flex items-center justify-between p-8">
              <div className="text-white">
                <p className="text-xl font-bold">Oferta del día</p>
                <h2 className="font-headline text-5xl font-extrabold">25% OFF!</h2>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold mb-4 text-left">
            Categorías
          </h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            {categories.map((category) => (
              <div
                key={category.name}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-20 h-20 bg-card/80 backdrop-blur-xl rounded-2xl shadow-md flex items-center justify-center transition-transform duration-300 hover:scale-110">
                  <category.icon className="h-10 w-10 text-primary" />
                </div>
                <span className="font-semibold text-foreground text-sm mt-1">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        <Recommendations />

        <section>
          <h2 className="font-headline text-2xl font-bold mb-4 text-left">
            Populares
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
