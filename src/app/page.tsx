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
import { Button } from '@/components/ui/button';

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
        <div className="text-left mb-8">
          <h1 className="font-headline text-4xl font-bold text-foreground">
            Hola, Johan 🍕
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            ¿Qué vas a comer hoy?
          </p>
        </div>

        <section className="mb-12">
           <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
            <CardContent className="relative flex items-center justify-between p-6">
              <div className='text-white'>
                <h2 className='font-bold text-4xl'>¡25%</h2>
                <p className='text-2xl'>OFF!</p>
              </div>
              <div>
                <Image 
                  src="https://placehold.co/150x100.png"
                  width={150}
                  height={100}
                  alt="Special Offer"
                  data-ai-hint="pizza illustration"
                  className='transform scale-125'
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-bold mb-4 text-left">
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
                <span className="font-semibold text-foreground text-sm">
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
