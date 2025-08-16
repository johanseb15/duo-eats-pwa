
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
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Day, RestaurantSettings } from '@/lib/types';
import { Separator } from './ui/separator';

const daysOfWeek: Day[] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const formSchema = z.object({
  whatsappNumber: z.string().min(8, 'El número debe tener al menos 8 dígitos.'),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm).'),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm).'),
  openDays: z.array(z.string()).refine(value => value.some(day => day), {
    message: 'Debes seleccionar al menos un día de apertura.',
  }),
});

interface SettingsFormProps {
  onSubmit: (values: RestaurantSettings) => void;
  settings: RestaurantSettings;
  isSubmitting: boolean;
}

export function SettingsForm({ onSubmit, settings, isSubmitting }: SettingsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);
  
  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as RestaurantSettings);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
         <FormField
            control={form.control}
            name="whatsappNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Número de WhatsApp</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: 5491112345678" {...field} />
                </FormControl>
                 <FormDescription>
                    Este número se usará para recibir los pedidos. Incluye el código de país.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />

        <Separator />

        <div>
            <h3 className="text-lg font-medium">Días de Apertura</h3>
            <FormField
            control={form.control}
            name="openDays"
            render={() => (
                <FormItem className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {daysOfWeek.map((day) => (
                    <FormField
                    key={day}
                    control={form.control}
                    name="openDays"
                    render={({ field }) => {
                        return (
                        <FormItem
                            key={day}
                            className="flex flex-row items-start space-x-3 space-y-0"
                        >
                            <FormControl>
                            <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                return checked
                                    ? field.onChange([...field.value, day])
                                    : field.onChange(
                                        field.value?.filter(
                                        (value) => value !== day
                                        )
                                    )
                                }}
                            />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">
                                {day}
                            </FormLabel>
                        </FormItem>
                        )
                    }}
                    />
                ))}
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <Separator />

         <div>
             <h3 className="text-lg font-medium">Horarios de Atención</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                    control={form.control}
                    name="openingTime"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hora de Apertura</FormLabel>
                        <FormControl>
                        <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="closingTime"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hora de Cierre</FormLabel>
                        <FormControl>
                        <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
         </div>


        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Ajustes
        </Button>
      </form>
    </Form>
  );
}
