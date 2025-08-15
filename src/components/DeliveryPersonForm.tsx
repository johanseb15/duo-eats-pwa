
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
import { addDeliveryPerson, updateDeliveryPerson, type DeliveryPersonInput } from '@/app/actions';
import { useEffect, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import type { DeliveryPerson } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  phone: z.string().min(8, {
    message: 'El teléfono debe tener al menos 8 caracteres.',
  }),
  status: z.enum(['active', 'inactive']),
});

interface DeliveryPersonFormProps {
  onFormSubmit: () => Promise<void>;
  person?: DeliveryPerson | null;
}

export function DeliveryPersonForm({ onFormSubmit, person }: DeliveryPersonFormProps) {
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (person) {
      form.reset({
        name: person.name,
        phone: person.phone,
        status: person.status,
      });
    } else {
       form.reset({
        name: '',
        phone: '',
        status: 'active',
       });
    }
  }, [person, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const personData: DeliveryPersonInput = values;

      if (person) {
         await updateDeliveryPerson(person.id, personData);
      } else {
         await addDeliveryPerson(personData);
      }
      await onFormSubmit();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 1122334455" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : (person ? 'Guardar Cambios' : 'Añadir Repartidor')}
        </Button>
      </form>
    </Form>
  );
}
