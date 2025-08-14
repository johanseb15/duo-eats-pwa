
'use client';

import Image from 'next/image';
import type { Promotion } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Autoplay from "embla-carousel-autoplay";
import { useRef } from 'react';

interface PromotionsCarouselProps {
  promotions: Promotion[];
}

export function PromotionsCarousel({ promotions }: PromotionsCarouselProps) {
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
        {promotions.map((promo) => (
          <CarouselItem key={promo.id}>
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-primary to-accent">
                <CardContent className="relative flex items-center justify-between p-6">
                    <div className="text-white z-10">
                        <h2 className="text-2xl font-bold">{promo.title}</h2>
                        <p className="text-sm">{promo.description}</p>
                    </div>
                     <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                            src={promo.image}
                            alt={promo.title}
                            fill
                            className="rounded-full object-cover"
                            data-ai-hint={promo.aiHint}
                        />
                     </div>
                </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
