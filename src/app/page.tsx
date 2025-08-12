import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle } from 'lucide-react';

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

export default function Home() {
  const categories = [
    { name: 'Pizza', icon: '🍕' },
    { name: 'Burgers', icon: '🍔' },
    { name: 'Salads', icon: '🥗' },
    { name: 'Desserts', icon: '🍰' },
    { name: 'Drinks', icon: '🥤' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="text-center md:text-left mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Hola, Johan 🍕
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            ¿Qué vas a comer hoy?
          </p>
        </div>

        <section className="mb-12">
          <h2 className="font-headline text-3xl font-semibold mb-4 text-center md:text-left">
            Ofertas del Día
          </h2>
          <Carousel
            opts={{
              align: 'start',
            }}
            className="w-full"
          >
            <CarouselContent>
              {products.slice(0, 3).map((product, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden border-2 border-primary/50 shadow-lg bg-card/60 backdrop-blur-xl">
                      <CardContent className="relative flex aspect-video items-center justify-center p-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={400}
                          height={225}
                          className="object-cover w-full h-full"
                          data-ai-hint={product.aiHint}
                        />
                        <Badge
                          variant="destructive"
                          className="absolute top-2 right-2 text-lg py-1 px-3 bg-primary text-primary-foreground border-none shadow-xl"
                        >
                          25% OFF
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-3xl font-semibold mb-4 text-center md:text-left">
            Categorías
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
            {categories.map((category) => (
              <div
                key={category.name}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-20 h-20 bg-card/60 backdrop-blur-xl rounded-2xl shadow-md flex items-center justify-center text-4xl">
                  {category.icon}
                </div>
                <span className="font-semibold text-foreground">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </section>
        
        <Recommendations />

        <section>
          <h2 className="font-headline text-3xl font-semibold mb-4 text-center md:text-left">
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
