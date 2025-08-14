
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
import { addAddress, updateAddress, type AddressInput } from '@/app/actions';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import type { UserAddress } from '@/lib/types';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido (ej: Casa, Trabajo).'),
  fullAddress: z.string().min(5, 'La dirección es requerida.'),
  neighborhood: z.string().min(2, 'El barrio es requerido.'),
  details: z.string().optional(),
});

interface AddressFormProps {
  userId: string;
  address?: UserAddress | null;
  onSubmitSuccess: () => void;
}

export function AddressForm({ userId, address, onSubmitSuccess }: AddressFormProps) {
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: address?.name || '',
      fullAddress: address?.fullAddress || '',
      neighborhood: address?.neighborhood || '',
      details: address?.details || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const addressData: AddressInput = values;
        
        const result = address
        ? await updateAddress(address.id, addressData)
        : await addAddress(userId, addressData);

        if (result.success) {
            onSubmitSuccess();
        }
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
              <FormLabel>Nombre / Alias</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Casa, Oficina de Mamá" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="fullAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección Completa</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Av. Corrientes 1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barrio</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Palermo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detalles Adicionales (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Piso 5, Depto B. Tocar timbre."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Dirección
        </Button>
      </form>
    </Form>
  );
}
