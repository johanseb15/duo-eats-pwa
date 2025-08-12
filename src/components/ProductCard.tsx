'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: 'Added to cart!',
      description: `${product.name} is now in your cart.`,
    });
  };

  return (
    <Card className="w-full overflow-hidden transition-shadow duration-300 rounded-3xl group bg-card/60 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-2xl">
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
          <CardTitle className="font-headline text-2xl truncate">
            {product.name}
          </CardTitle>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <p className="text-xl font-bold text-foreground">S/. {product.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart} size="lg" className="rounded-full">
          Añadir
        </Button>
      </CardFooter>
    </Card>
  );
}
