
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
import { addDeliveryZone, updateDeliveryZone, type DeliveryZoneInput } from '@/app/actions';
import { useEffect, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import type { DeliveryZone } from '@/lib/types';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  neighborhoods: z.string().min(2, {
    message: 'Debes añadir al menos un barrio.',
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
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      neighborhoods: '',
      cost: 0,
    },
  });

  useEffect(() => {
    if (zone) {
      form.reset({
        neighborhoods: zone.neighborhoods.join(', '),
        cost: zone.cost,
      });
    } else {
       form.reset({
        neighborhoods: '',
        cost: 0,
       });
    }
  }, [zone, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const zoneData: DeliveryZoneInput = {
        neighborhoods: values.neighborhoods.split(',').map(n => n.trim()).filter(Boolean),
        cost: values.cost,
      };

      if (zoneData.neighborhoods.length === 0) {
          form.setError('neighborhoods', { message: 'Debes añadir al menos un barrio válido.' });
          return;
      }

      if (zone) {
         await updateDeliveryZone(zone.id, zoneData);
      } else {
         await addDeliveryZone(zoneData);
      }
      await onFormSubmit();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="neighborhoods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barrios</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Palermo, Belgrano, Recoleta" {...field} />
              </FormControl>
              <FormDescription>
                Escribe los nombres de los barrios separados por comas.
              </FormDescription>
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
