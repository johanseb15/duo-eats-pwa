'use client';

import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { useToast } from '@/hooks/use-toast';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: 'Added to cart!',
      description: `${product.name} is now in your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
       <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-background/50 text-foreground hover:bg-background z-10"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

      <div className="flex flex-col items-center pt-20">
         <div className="relative w-64 h-64">
            <Image
            src={product.image}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
            data-ai-hint={product.aiHint}
            />
         </div>

        <div className="w-full text-center mt-8 px-6">
          <h1 className="font-headline text-4xl font-bold text-foreground">
            {product.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {product.description}
          </p>

           <p className="text-3xl font-bold text-foreground mt-6">
              S/. {product.price.toFixed(2)}
            </p>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t">
         <Button onClick={handleAddToCart} size="lg" className="w-full rounded-full text-lg py-6 px-8">
            Agregar al carrito
          </Button>
      </div>
    </div>
  );
}
