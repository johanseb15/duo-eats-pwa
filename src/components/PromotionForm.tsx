
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
import { addPromotion, updatePromotion, type PromotionInput } from '@/app/actions';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Promotion } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'El título debe tener al menos 2 caracteres.',
  }),
  description: z.string().min(10, {
    message: 'La descripción debe tener al menos 10 caracteres.',
  }),
  image: z.string().url({
    message: 'Por favor, introduce una URL de imagen válida.',
  }).or(z.literal('')),
   aiHint: z.string().max(25, {
    message: 'La pista de IA no debe superar los 25 caracteres.',
  }).optional(),
});

interface PromotionFormProps {
  onPromotionSubmit: () => void;
  promotion?: Promotion | null;
}

export function PromotionForm({ onPromotionSubmit, promotion }: PromotionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      aiHint: '',
    },
  });

  useEffect(() => {
    if (promotion) {
      form.reset({
        title: promotion.title,
        description: promotion.description,
        image: promotion.image,
        aiHint: promotion.aiHint,
      })
    } else {
       form.reset({
        title: '',
        description: '',
        image: '',
        aiHint: '',
       });
    }
  }, [promotion, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    const promotionData: PromotionInput = {
      title: values.title,
      description: values.description,
      image: values.image || `https://placehold.co/300x150.png`,
      aiHint: values.aiHint || values.title.toLowerCase().split(' ').slice(0, 2).join(' '),
    };

    let result;
    if (promotion) {
       result = await updatePromotion(promotion.id, promotionData);
    } else {
       result = await addPromotion(promotionData);
    }

    if (result.success) {
      onPromotionSubmit();
    } else {
      console.error('Failed to submit promotion');
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Promoción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: ¡Dúo Dinámico!" {...field} />
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
                  placeholder="Una breve descripción de la promoción..."
                  {...field}
                />
              </FormControl>
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
                <Input placeholder="Ej: pizza promo" {...field} />
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
          {isSubmitting ? 'Guardando...' : (promotion ? 'Guardar Cambios' : 'Añadir Promoción')}
        </Button>
      </form>
    </Form>
  );
}
