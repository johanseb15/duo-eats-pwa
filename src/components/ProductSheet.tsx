

'use client';

import Image from 'next/image';
import { useCart } from '@/store/cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Currency, Product } from '@/lib/types';
import { Button } from './ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { useFavorites } from '@/store/favorites';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface ProductSheetProps {
    product: Product;
}

const currentCurrency: Currency = 'ARS';
const currencySymbol = '$';


export function ProductSheet({ product }: ProductSheetProps) {
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { toast } = useToast();
    const isFav = isFavorite(product.id);
    const [notes, setNotes] = useState('');
    const [imageLoading, setImageLoading] = useState(true);

    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(() => {
        const defaults: { [key: string]: string } = {};
        if (product.options) {
            product.options.forEach(option => {
              if (option.values && option.values.length > 0) {
                defaults[option.name] = option.values[0].name;
              }
            });
        }
        return defaults;
    });

    const finalPrice = useMemo(() => {
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
        const cartItem = {
          ...product,
          selectedOptions: selectedOptions,
          finalPrice: finalPrice,
          notes: notes,
        };
        addToCart(cartItem);
        toast({
          title: '¡Añadido al carrito!',
          description: `${product.name} está ahora en tu carrito.`,
        });
    };

     const handleFavoriteClick = () => {
        toggleFavorite(product);
        toast({
            title: isFav ? 'Eliminado de favoritos' : 'Añadido a favoritos',
            description: `${product.name} ${isFav ? 'ya no está' : 'está ahora'} en tus favoritos.`,
        });
    };
    

    return (
        <div className="flex flex-col h-[90vh] sm:h-auto">
            <ScrollArea className="flex-grow">
                <div className="relative h-72 w-full">
                    {imageLoading && (
                        <div className="absolute inset-0 bg-muted animate-pulse" />
                    )}
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                        data-ai-hint={product.aiHint}
                        loading="lazy"
                        onLoad={() => setImageLoading(false)}
                    />
                    {product.stock <= 0 && (
                        <Badge variant="destructive" className="absolute top-4 left-4 text-lg">Sin Stock</Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>
                <DialogHeader className="p-6 -mt-16 relative bg-background rounded-t-3xl text-left">
                    <div className="flex justify-between items-start">
                        <DialogTitle className="text-3xl font-bold text-foreground max-w-[calc(100%-4rem)]">{product.name}</DialogTitle>
                         <Button variant="ghost" size="icon" className="rounded-full text-primary flex-shrink-0 hover:bg-primary/10 transition-colors" onClick={handleFavoriteClick}>
                            <Heart className={cn("h-7 w-7", isFav && "fill-current")} />
                        </Button>
                    </div>
                    <DialogDescription className="text-muted-foreground mt-2">{product.description}</DialogDescription>
                </DialogHeader>
                <div className="p-6 pt-0 bg-background space-y-6">
                    {product.options && product.options.length > 0 && (
                    <div className="space-y-6">
                        {product.options.map((option) => (
                        <div key={option.name}>
                            <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                            <RadioGroup 
                            value={selectedOptions[option.name]}
                            onValueChange={(value) => handleOptionChange(option.name, value)}
                            className="space-y-2"
                            >
                            {option.values.map((value) => (
                                <Label key={value.name} htmlFor={`${option.name}-${value.name}`} className="flex items-center space-x-3 bg-card/60 backdrop-blur-xl p-4 rounded-xl has-[:checked]:ring-2 has-[:checked]:ring-primary transition-all">
                                    <RadioGroupItem value={value.name} id={`${option.name}-${value.name}`} />
                                    <span className="flex justify-between w-full font-medium">
                                        <span>{value.name}</span>
                                        {value.priceModifier?.[currentCurrency] > 0 && <span>+ {currencySymbol}{value.priceModifier[currentCurrency].toFixed(2)}</span>}
                                    </span>
                                </Label>
                            ))}
                            </RadioGroup>
                        </div>
                        ))}
                    </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-lg mb-2">Notas para la cocina (opcional)</h3>
                        <Textarea 
                            placeholder="Ej: Sin cebolla, bien cocido, etc."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
            </ScrollArea>
             <DialogFooter className="p-6 bg-background/95 backdrop-blur-xl border-t sticky bottom-0 shadow-lg">
                <div className="flex justify-between items-center w-full gap-4">
                     <p className="text-3xl font-extrabold text-primary">
                        {currencySymbol}{finalPrice.toFixed(2)}
                    </p>
                    <DialogClose asChild>
                      <Button 
                        onClick={handleAddToCart} 
                        size="lg" 
                        className="rounded-full flex-grow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]" 
                        disabled={product.stock <= 0}
                      >
                          {product.stock <= 0 ? 'Sin Stock' : 'Agregar al carrito'}
                      </Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </div>
    )
}
