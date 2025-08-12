'use client';

import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import type { ProductOption, ProductOptionValue } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const product = products.find((p) => p.id === params.id);

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  if (!product) {
    notFound();
  }
  
  const handleOptionChange = (optionName: string, valueName: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: valueName }));
  };

  const finalPrice = useMemo(() => {
    if (!product?.options) return product.price;

    const optionsPrice = Object.entries(selectedOptions).reduce((total, [optionName, valueName]) => {
      const option = product.options?.find(opt => opt.name === optionName);
      const value = option?.values.find(val => val.name === valueName);
      return total + (value?.priceModifier || 0);
    }, 0);

    return product.price + optionsPrice;
  }, [product, selectedOptions]);
  
  const handleAddToCart = () => {
    // Ensure default options are selected if none are chosen
    const finalSelectedOptions = { ...selectedOptions };
    product.options?.forEach(option => {
      if (!finalSelectedOptions[option.name]) {
        finalSelectedOptions[option.name] = option.values[0].name;
      }
    });

    const cartItem = {
      ...product,
      selectedOptions: finalSelectedOptions,
      finalPrice: finalPrice,
    };
    addToCart(cartItem);
    toast({
      title: '¡Añadido al carrito!',
      description: `${product.name} está ahora en tu carrito.`,
    });
  };

  return (
    <div className="min-h-screen bg-background relative pb-24">
       <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-background/50 text-foreground hover:bg-background z-10"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

      <div className="relative h-72 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          objectFit="cover"
          className="object-cover"
          data-ai-hint={product.aiHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="p-6 -mt-16 relative bg-background rounded-t-3xl">
        <h1 className="text-3xl font-bold text-foreground">
          {product.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          {product.description}
        </p>

        {product.options && (
          <div className="mt-6">
            {product.options.map((option) => (
              <div key={option.name} className="mb-4">
                <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                <RadioGroup 
                  defaultValue={option.values[0].name}
                  onValueChange={(value) => handleOptionChange(option.name, value)}
                >
                  {option.values.map((value) => (
                    <div key={value.name} className="flex items-center space-x-2 bg-card/60 backdrop-blur-xl p-3 rounded-xl">
                      <RadioGroupItem value={value.name} id={`${option.name}-${value.name}`} />
                      <Label htmlFor={`${option.name}-${value.name}`} className="flex justify-between w-full">
                        <span>{value.name}</span>
                        {value.priceModifier > 0 && <span>+ S/. {value.priceModifier.toFixed(2)}</span>}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
           <p className="text-4xl font-extrabold text-foreground">
              S/. {finalPrice.toFixed(2)}
            </p>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t">
         <Button onClick={handleAddToCart} size="lg" className="w-full rounded-full text-lg py-7">
            Agregar al carrito
          </Button>
      </div>
    </div>
  );
}
