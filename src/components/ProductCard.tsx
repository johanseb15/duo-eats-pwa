
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProductSheet } from './ProductSheet';

interface ProductCardProps {
  product: Product;
}

const currentCurrency = 'ARS';
const currencySymbol = '$';

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="w-full overflow-hidden transition-all duration-300 rounded-2xl group bg-card/80 backdrop-blur-xl border-white/20 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer">
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-0 flex items-center gap-4">
              <div className="relative w-28 h-28 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  data-ai-hint={product.aiHint}
                />
              </div>
              <div className="py-3 pr-3 flex-grow">
                <CardTitle className="text-lg font-semibold truncate">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1 h-10 overflow-hidden text-sm">
                  {product.description}
                </CardDescription>
                 <p className="text-lg font-bold text-foreground mt-2">{currencySymbol}{product.price[currentCurrency].toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetTrigger>
      <SheetContent className="w-full max-w-lg p-0">
         <ProductSheet product={product} />
      </SheetContent>
    </Sheet>
  );
}
