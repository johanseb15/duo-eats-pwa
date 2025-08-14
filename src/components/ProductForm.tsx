
'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addProduct, updateProduct, type ProductInput } from '@/app/actions';
import { useEffect, useState } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import type { Currency, Prices, Product, ProductCategoryData } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Separator } from './ui/separator';

const currentCurrency: Currency = 'ARS';

const optionValueSchema = z.object({
  name: z.string().min(1, 'El nombre del valor es requerido.'),
  priceModifier: z.coerce.number().default(0),
});

const optionSchema = z.object({
  name: z.string().min(1, 'El nombre de la opción es requerido.'),
  values: z.array(optionValueSchema).min(1, 'Debe haber al menos un valor por opción.'),
});

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  description: z.string().min(10, {
    message: 'La descripción debe tener al menos 10 caracteres.',
  }),
  price: z.coerce.number().positive({
    message: 'El precio debe ser un número positivo.',
  }),
  stock: z.coerce.number().min(0, {
    message: 'El stock no puede ser negativo.'
  }).default(0),
  category: z.string({
    required_error: "Debes seleccionar una categoría.",
  }),
  image: z.string().url({
    message: 'Por favor, introduce una URL de imagen válida.',
  }).or(z.literal('')),
   aiHint: z.string().max(25, {
    message: 'La pista de IA no debe superar los 25 caracteres.',
  }).optional(),
  options: z.array(optionSchema).optional(),
});

interface ProductFormProps {
  onProductSubmit: () => Promise<void>;
  product?: Product | null;
}

export function ProductForm({ onProductSubmit, product }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ProductCategoryData[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCol = collection(db, 'categories');
        const q = query(categoriesCol, orderBy('name'));
        const snapshot = await getDocs(q);
        const categoryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductCategoryData));
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories for Product Form:", error);
      }
    };
    fetchCategories();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      image: '',
      aiHint: '',
      category: '',
      options: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });

  useEffect(() => {
    if (product) {
      const productOptions = product.options?.map(opt => ({
          name: opt.name,
          values: opt.values.map(val => ({
              name: val.name,
              priceModifier: val.priceModifier[currentCurrency] || 0
          }))
      })) || [];

      form.reset({
        name: product.name,
        description: product.description,
        price: product.price[currentCurrency],
        stock: product.stock,
        image: product.image,
        aiHint: product.aiHint,
        category: product.category,
        options: productOptions,
      });
    } else {
       form.reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image: '',
        aiHint: '',
        category: '',
        options: [],
       });
    }
  }, [product, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    const prices: Partial<Prices> = {
      [currentCurrency]: values.price,
    };
    
    if (currentCurrency === 'ARS') {
      prices['USD'] = values.price / 1000;
    } else {
      prices['ARS'] = values.price * 1000;
    }

    const finalOptions = values.options?.map(opt => ({
      name: opt.name,
      values: opt.values.map(val => {
        const valuePrices: Partial<Prices> = {};
        valuePrices[currentCurrency] = val.priceModifier;
        if (currentCurrency === 'ARS') {
           valuePrices['USD'] = val.priceModifier / 1000;
        } else {
            valuePrices['ARS'] = val.priceModifier * 1000;
        }
        return { name: val.name, priceModifier: valuePrices as Prices };
      })
    })) || [];


    const productData: ProductInput = {
      name: values.name,
      description: values.description,
      price: prices as Prices,
      stock: values.stock,
      category: values.category,
      image: values.image || `https://placehold.co/400x225.png`,
      aiHint: values.aiHint || values.name.toLowerCase().split(' ').slice(0, 2).join(' '),
      options: finalOptions,
    };

    try {
        if (product) {
           await updateProduct(product.id, productData);
        } else {
           await addProduct(productData);
        }
        await onProductSubmit();
    } catch (error) {
        console.error('Failed to submit product', error);
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Pizza Margherita" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Una breve descripción del producto..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Base ({currentCurrency})</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={categories.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <FormDescription>La categoría debe ser un "slug", ej: "pizzas"</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la Imagen</FormLabel>
              <FormControl>
                <Input placeholder="https://ejemplo.com/imagen.png" {...field} />
              </FormControl>
              <FormDescription>
                Si se deja en blanco, se usará una imagen de marcador de posición.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="aiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pista para IA</FormLabel>
              <FormControl>
                <Input placeholder="Ej: pizza cheese" {...field} />
              </FormControl>
               <FormDescription>
                Una o dos palabras para buscar imágenes de stock (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />
        
        <div>
            <h3 className="text-lg font-medium mb-2">Opciones del Producto</h3>
            <div className="space-y-4">
                {fields.map((field, index) => (
                   <OptionField key={field.id} control={form.control} optionIndex={index} remove={remove} />
                ))}
            </div>
             <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ name: '', values: [{ name: '', priceModifier: 0 }] })}
                >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Opción
            </Button>
        </div>


        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : (product ? 'Guardar Cambios' : 'Añadir Producto')}
        </Button>
      </form>
    </Form>
  );
}


interface OptionFieldProps {
    control: any;
    optionIndex: number;
    remove: (index: number) => void;
}

function OptionField({ control, optionIndex, remove }: OptionFieldProps) {
    const { fields, append, remove: removeValue } = useFieldArray({
        control,
        name: `options.${optionIndex}.values`
    });

    return (
        <div className="p-4 border rounded-lg space-y-3 relative bg-muted/30">
            <FormField
                control={control}
                name={`options.${optionIndex}.name`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre de la Opción</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: Tamaño" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <h4 className="font-medium text-sm">Valores de la Opción:</h4>
            <div className="space-y-2">
                {fields.map((valueField, valueIndex) => (
                    <div key={valueField.id} className="flex gap-2 items-end">
                        <FormField
                            control={control}
                            name={`options.${optionIndex}.values.${valueIndex}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormLabel className="sr-only">Nombre del Valor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Mediana" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`options.${optionIndex}.values.${valueIndex}.priceModifier`}
                            render={({ field }) => (
                                <FormItem>
                                     <FormLabel className="sr-only">Modificador de Precio</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="Ej: 800" {...field} />
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeValue(valueIndex)} className="text-destructive">
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
            </div>
             <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', priceModifier: 0 })}
                className="mt-2"
                >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Valor
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => remove(optionIndex)} className="absolute top-2 right-2">
                Eliminar Opción
            </Button>
        </div>
    )
}
