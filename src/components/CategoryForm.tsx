
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
import { addCategory, updateCategory, generateIconSuggestion, type CategoryInput } from '@/app/actions';
import { useEffect, useState, useTransition } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import type { ProductCategoryData } from '@/lib/types';
import * as LucideIcons from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  slug: z.string().min(2, {
    message: 'El slug debe tener al menos 2 caracteres.',
  }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras minúsculas, números y guiones.'),
  icon: z.string().refine(val => Object.keys(LucideIcons).includes(val), {
    message: 'El ícono debe ser un nombre válido de Lucide-React.',
  }),
});

interface CategoryFormProps {
  onSubmitSuccess: () => Promise<void>;
  category?: ProductCategoryData | null;
}

export function CategoryForm({ onSubmitSuccess, category }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      icon: 'Package',
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        icon: category.icon,
      });
    } else {
       form.reset({
        name: '',
        slug: '',
        icon: 'Package',
       });
    }
  }, [category, form]);

  const handleSuggestIcon = () => {
    const categoryName = form.getValues('name');
    if (!categoryName) return;

    startTransition(async () => {
      const suggestion = await generateIconSuggestion(categoryName);
      if (suggestion && (LucideIcons as any)[suggestion]) {
        form.setValue('icon', suggestion, { shouldValidate: true });
      }
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    const categoryData: CategoryInput = {
      name: values.name,
      slug: values.slug,
      icon: values.icon,
    };

    try {
        if (category) {
            await updateCategory(category.id, categoryData);
        } else {
            await addCategory(categoryData);
        }
        await onSubmitSuccess();
    } catch (error) {
      console.error('Failed to submit category', error);
      // Optionally, show an error toast to the user
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
              <FormLabel>Nombre de la Categoría</FormLabel>
                <div className="flex gap-2 items-center">
                    <FormControl>
                        <Input placeholder="Ej: Platos Fuertes" {...field} onChange={(e) => {
                        field.onChange(e);
                        const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        form.setValue('slug', slug);
                        }}/>
                    </FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={handleSuggestIcon} disabled={isSuggesting}>
                        {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    </Button>
                </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="ej: platos-fuertes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Ícono (Lucide)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Beef" {...field} />
              </FormControl>
               <FormDescription>
                Busca un nombre de ícono en <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">lucide.dev</a> o usa el sugeridor de IA.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : (category ? 'Guardar Cambios' : 'Añadir Categoría')}
        </Button>
      </form>
    </Form>
  );
}
