
'use client';

import { useForm } from 'react-hook-form';
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
import { Loader2 } from 'lucide-react';
import type { Currency, Prices, Product, ProductCategoryData } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const currentCurrency: Currency = 'ARS';

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
  category: z.string({
    required_error: "Debes seleccionar una categoría.",
  }),
  image: z.string().url({
    message: 'Por favor, introduce una URL de imagen válida.',
  }).or(z.literal('')),
   aiHint: z.string().max(25, {
    message: 'La pista de IA no debe superar los 25 caracteres.',
  }).optional(),
});

interface ProductFormProps {
  onProductSubmit: () => void;
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
      image: '',
      aiHint: '',
      category: '',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price[currentCurrency],
        image: product.image,
        aiHint: product.aiHint,
        category: product.category,
      })
    } else {
       form.reset({
        name: '',
        description: '',
        price: 0,
        image: '',
        aiHint: '',
        category: categories.length > 0 ? categories[0].name : '',
       });
    }
  }, [product, form, categories]);

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

    const productData: ProductInput = {
      name: values.name,
      description: values.description,
      price: prices as Prices,
      category: values.category,
      image: values.image || `https://placehold.co/400x225.png`,
      aiHint: values.aiHint || values.name.toLowerCase().split(' ').slice(0, 2).join(' '),
    };

    let result;
    if (product) {
       result = await updateProduct(product.id, productData);
    } else {
       result = await addProduct(productData);
    }

    if (result.success) {
      onProductSubmit();
    } else {
      console.error('Failed to submit product');
    }
    setIsSubmitting(false);
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
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel>Precio (en {currentCurrency})</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={categories.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : (product ? 'Guardar Cambios' : 'Añadir Producto')}
        </Button>
      </form>
    </Form>
  );
}
