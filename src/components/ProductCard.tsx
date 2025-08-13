
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

const currentCurrency = 'ARS';
const currencySymbol = '$';

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has options, redirect to product page
    if (product.options && product.options.length > 0) {
      router.push(`/product/${product.id}`);
      return;
    }
    
    // Set default options and final price for products without options
    const productToAdd = {
      ...product,
      selectedOptions: {},
      finalPrice: product.price[currentCurrency],
    };

    addToCart(productToAdd);
    toast({
      title: '¡Añadido al carrito!',
      description: `${product.name} está ahora en tu carrito.`,
    });
  };

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 rounded-3xl group bg-card/80 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-2xl hover:-translate-y-1">
      <Link href={`/product/${product.id}`} className="block">
        <CardHeader className="p-0">
          <div className="aspect-video overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={225}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={product.aiHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-xl font-semibold truncate">
            {product.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1 h-10 overflow-hidden">
            {product.description}
          </CardDescription>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <p className="text-2xl font-bold text-foreground">{currencySymbol}{product.price[currentCurrency].toFixed(2)}</p>
        <Button onClick={handleAddToCart} size="icon" className="rounded-full">
          <Plus />
        </Button>
      </CardFooter>
    </Card>
  );
}
