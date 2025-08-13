
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addDeliveryZone, updateDeliveryZone, type DeliveryZoneInput } from '@/app/actions';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { DeliveryZone } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  cost: z.coerce.number().min(0, {
    message: 'El costo no puede ser negativo.',
  }),
});

interface DeliveryZoneFormProps {
  onFormSubmit: () => Promise<void>;
  zone?: DeliveryZone | null;
}

const currentCurrency = 'ARS';

export function DeliveryZoneForm({ onFormSubmit, zone }: DeliveryZoneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cost: 0,
    },
  });

  useEffect(() => {
    if (zone) {
      form.reset({
        name: zone.name,
        cost: zone.cost,
      });
    } else {
       form.reset({
        name: '',
        cost: 0,
       });
    }
  }, [zone, form.reset]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    const zoneData: DeliveryZoneInput = {
      name: values.name,
      cost: values.cost,
    };

    try {
        if (zone) {
           await updateDeliveryZone(zone.id, zoneData);
        } else {
           await addDeliveryZone(zoneData);
        }
        await onFormSubmit();
    } catch (error) {
        console.error('Failed to submit delivery zone', error);
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
              <FormLabel>Nombre de la Zona</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Zona Céntrica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo de Envío (en {currentCurrency})</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : (zone ? 'Guardar Cambios' : 'Añadir Zona')}
        </Button>
      </form>
    </Form>
  );
}
