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
    <div className="min-h-screen bg-background">
      <div className="relative h-[50vh]">
        <Image
          src={product.image}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
          data-ai-hint={product.aiHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-background/50 text-foreground hover:bg-background"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="relative -mt-16 p-6">
        <div className="bg-background/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20">
          <h1 className="font-headline text-4xl font-bold text-foreground">
            {product.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {product.description}
          </p>

          <div className="mt-6 flex justify-between items-center">
            <span className="text-3xl font-bold text-primary">
              S/. {product.price.toFixed(2)}
            </span>
            <Button onClick={handleAddToCart} size="lg" className="rounded-full text-lg py-6 px-8">
              Añadir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
