
'use client';

import Image from 'next/image';
import type { Product, Promotion } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Autoplay from "embla-carousel-autoplay";
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { ProductSheet } from './ProductSheet';

interface PromotionsCarouselProps {
  promotions: Promotion[];
  products: Product[];
}

export default function PromotionsCarousel({ promotions, products }: PromotionsCarouselProps) {
    const plugin = useRef(
      Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
    )

    if (!promotions || promotions.length === 0) {
        return null;
    }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      plugins={[plugin.current]}
      className="w-full"
    >
      <CarouselContent>
        {promotions.map((promo) => {
          const product = products.find(p => p.id === promo.productId);
          
          const CardComponent = (
             <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-primary to-accent transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="relative flex flex-col md:flex-row items-center justify-between p-6 gap-4">
                    <div className="text-white z-10 flex-grow">
                        <h2 className="text-2xl font-bold">{promo.title}</h2>
                        <p className="text-sm mt-1">{promo.description}</p>
                    </div>
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                            src={promo.image}
                            alt={promo.title}
                            width={96}
                            height={96}
                            className="rounded-full object-cover"
                            data-ai-hint={promo.aiHint}
                            loading="lazy"
                        />
                    </div>
                </CardContent>
            </Card>
          )

          return (
            <CarouselItem key={promo.id}>
               <Dialog>
                {product ? (
                  <DialogTrigger asChild>
                    {CardComponent}
                  </DialogTrigger>
                ) : (
                  CardComponent
                )}
                {product && (
                  <DialogContent className="w-full max-w-lg p-0 border-0">
                    <ProductSheet product={product} />
                  </DialogContent>
                )}
              </Dialog>
            </CarouselItem>
        )})}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
