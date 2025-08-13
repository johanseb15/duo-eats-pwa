
'use client';

import Image from 'next/image';
import { useCart } from '@/store/cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Currency, Product } from '@/lib/types';
import { Button } from './ui/button';
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';

interface ProductSheetProps {
    product: Product;
}

const currentCurrency: Currency = 'ARS';
const currencySymbol = '$';


export function ProductSheet({ product }: ProductSheetProps) {
    const { addToCart } = useCart();
    const { toast } = useToast();

    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(() => {
        const defaults: { [key: string]: string } = {};
        if (product.options) {
            product.options.forEach(option => {
              defaults[option.name] = option.values[0].name;
            });
        }
        return defaults;
    });

    const finalPrice = useMemo(() => {
        if (!product) return 0;
        let basePrice = product.price[currentCurrency];

        if (!product.options || Object.keys(selectedOptions).length === 0) {
            return basePrice;
        }

        const optionsPrice = Object.entries(selectedOptions).reduce((total, [optionName, valueName]) => {
          const option = product.options?.find(opt => opt.name === optionName);
          const value = option?.values.find(val => val.name === valueName);
          return total + (value?.priceModifier?.[currentCurrency] || 0);
        }, 0);

        return basePrice + optionsPrice;
    }, [product, selectedOptions]);

    const handleOptionChange = (optionName: string, valueName: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: valueName }));
    };
    
    const handleAddToCart = () => {
        if (!product) return;
        const cartItem = {
          ...product,
          selectedOptions: selectedOptions,
          finalPrice: finalPrice,
        };
        addToCart(cartItem);
        toast({
          title: '¡Añadido al carrito!',
          description: `${product.name} está ahora en tu carrito.`,
        });
        // Close the sheet - this is handled by the Sheet's default behavior,
        // no need for router.push or router.back()
    };


    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-grow">
                <div className="relative h-72 w-full">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        style={{objectFit:"cover"}}
                        className="object-cover"
                        data-ai-hint={product.aiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                <SheetHeader className="p-6 -mt-16 relative bg-background rounded-t-3xl text-left">
                    <SheetTitle className="text-3xl font-bold text-foreground">{product.name}</SheetTitle>
                    <SheetDescription className="text-muted-foreground mt-2">{product.description}</SheetDescription>
                </SheetHeader>
                <div className="p-6 bg-background">
                    {product.options && product.options.length > 0 && (
                    <div className="mt-6">
                        {product.options.map((option) => (
                        <div key={option.name} className="mb-4">
                            <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                            <RadioGroup 
                            value={selectedOptions[option.name]}
                            onValueChange={(value) => handleOptionChange(option.name, value)}
                            >
                            {option.values.map((value) => (
                                <div key={value.name} className="flex items-center space-x-2 bg-card/60 backdrop-blur-xl p-3 rounded-xl">
                                <RadioGroupItem value={value.name} id={`${option.name}-${value.name}`} />
                                <Label htmlFor={`${option.name}-${value.name}`} className="flex justify-between w-full">
                                    <span>{value.name}</span>
                                    {value.priceModifier?.[currentCurrency] > 0 && <span>+ {currencySymbol} {value.priceModifier[currentCurrency].toFixed(2)}</span>}
                                </Label>
                                </div>
                            ))}
                            </RadioGroup>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
            </ScrollArea>
             <SheetFooter className="p-6 bg-background/80 backdrop-blur-xl border-t sticky bottom-0">
                <div className="flex justify-between items-center w-full gap-4">
                     <p className="text-2xl font-extrabold text-foreground">
                        {currencySymbol} {finalPrice.toFixed(2)}
                    </p>
                    <Button onClick={handleAddToCart} size="lg" className="rounded-full flex-grow">
                        Agregar al carrito
                    </Button>
                </div>
            </SheetFooter>
        </div>
    )
}
