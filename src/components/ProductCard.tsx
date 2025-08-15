
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Heart, Minus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductSheet } from './ProductSheet';
import { useFavorites } from '@/store/favorites';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { useCart } from '@/store/cart';

interface ProductCardProps {
  product: Product;
}

const currentCurrency = 'ARS';
const currencySymbol = '$';

const getCartItemId = (item: Product, selectedOptions: any) => {
    const optionsIdentifier = selectedOptions && Object.keys(selectedOptions).length > 0
      ? Object.entries(selectedOptions).sort().map(([key, value]) => `${key}:${value}`).join('-')
      : '';
    return `${item.id}-${optionsIdentifier}`;
};

export function ProductCard({ product }: ProductCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const { items, addToCart, updateQuantity } = useCart();
  const isFav = isFavorite(product.id);

  // Find the first cart item that matches the product ID, regardless of options.
  const cartItem = items.find(item => item.id === product.id);
  const cartItemId = cartItem ? getCartItemId(cartItem, cartItem.selectedOptions) : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product);
    toast({
        title: isFav ? 'Eliminado de favoritos' : 'Añadido a favoritos',
        description: `${product.name} ${isFav ? 'ya no está' : 'está ahora'} en tus favoritos.`,
    })
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // If product has options, open the sheet. Otherwise, add directly.
    if (product.options && product.options.length > 0) {
        // This click will be captured by the DialogTrigger, so we don't need to do anything.
        return;
    }

    addToCart({
        ...product,
        finalPrice: product.price[currentCurrency],
        selectedOptions: {},
    });
    toast({
        title: '¡Añadido al carrito!',
        description: `${product.name} está ahora en tu carrito.`,
    });
  }

  const handleQuantityChange = (e: React.MouseEvent, newQuantity: number) => {
     e.stopPropagation();
     e.preventDefault();
     if (cartItemId) {
         updateQuantity(cartItemId, newQuantity);
     }
  }

  const renderActionButton = () => {
    if (cartItem && cartItemId) {
        return (
             <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className='h-9 w-9 rounded-full' onClick={(e) => handleQuantityChange(e, cartItem.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold text-lg">{cartItem.quantity}</span>
                <Button variant="outline" size="icon" className='h-9 w-9 rounded-full' onClick={(e) => handleQuantityChange(e, cartItem.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <DialogTrigger asChild>
             <Button size='icon' className='rounded-full h-9 w-9' aria-label={`Añadir ${product.name} al carrito`} disabled={product.stock <= 0} onClick={handleAddClick}>
                <Plus/>
            </Button>
        </DialogTrigger>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full overflow-hidden transition-all duration-300 rounded-2xl group bg-card/80 backdrop-blur-xl border-white/20 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer">
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-0 flex items-center gap-4">
              <div className="relative w-28 h-28 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={112}
                  height={112}
                  className="object-cover h-full w-full"
                  data-ai-hint={product.aiHint}
                />
                 {product.stock <= 0 && (
                  <Badge variant="destructive" className="absolute top-2 left-2">Sin Stock</Badge>
                )}
              </div>
              <div className="py-3 pr-3 flex-grow">
                <CardTitle className="text-lg font-semibold truncate leading-tight">
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
                        {renderActionButton()}
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg p-0 border-0">
         <ProductSheet product={product} />
      </DialogContent>
    </Dialog>
  );
}
