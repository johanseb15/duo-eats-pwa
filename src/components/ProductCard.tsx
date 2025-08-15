
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Heart } from 'lucide-react';
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
import { useFavorites } from '@/store/favorites';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
}

const currentCurrency = 'ARS';
const currencySymbol = '$';

export function ProductCard({ product }: ProductCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const isFav = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se abra el sheet
    toggleFavorite(product);
    toast({
        title: isFav ? 'Eliminado de favoritos' : 'Añadido a favoritos',
        description: `${product.name} ${isFav ? 'ya no está' : 'está ahora'} en tus favoritos.`,
    })
  };

  return (
    <Sheet>
        <div className="w-full overflow-hidden transition-all duration-300 rounded-2xl group bg-card/80 backdrop-blur-xl border-white/20 shadow-md hover:shadow-xl hover:-translate-y-1">
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-0 flex items-center gap-4">
              <div className="relative w-28 h-28 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={112}
                  height={112}
                  className="object-cover"
                  data-ai-hint={product.aiHint}
                />
                 {product.stock <= 0 && (
                  <Badge variant="destructive" className="absolute top-2 left-2">Sin Stock</Badge>
                )}
              </div>
              <div className="py-3 pr-3 flex-grow">
                <CardTitle className="text-lg font-semibold truncate">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1 h-10 overflow-hidden text-sm">
                  {product.description}
                </CardDescription>
                <div className='flex justify-between items-center mt-2'>
                    <p className="text-lg font-bold text-foreground">{currencySymbol}{product.price[currentCurrency].toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                         <Button variant="ghost" size="icon" className="rounded-full text-primary" onClick={handleFavoriteClick} aria-label={`Marcar ${product.name} como favorito`}>
                            <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                        </Button>
                        <SheetTrigger asChild>
                            <Button size='icon' className='rounded-full h-9 w-9' aria-label={`Añadir ${product.name} al carrito`} disabled={product.stock <= 0}>
                                <Plus/>
                            </Button>
                        </SheetTrigger>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      <SheetContent className="w-full max-w-lg p-0">
         <ProductSheet product={product} />
      </SheetContent>
    </Sheet>
  );
}
