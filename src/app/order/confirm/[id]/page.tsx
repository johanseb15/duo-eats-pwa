
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order, RestaurantSettings } from '@/lib/types';
import { useEffect, useState } from 'react';
import { fetchOrderById, fetchRestaurantSettings } from '../../../actions';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const currencySymbol = '$';

const WhatsAppRedirect = ({ order, settings }: { order: Order | null, settings: RestaurantSettings | null }) => {
    const router = useRouter();

    const sendWhatsApp = () => {
        if (!order || !settings) return;

        const phone = settings.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '549111234567';
        let message = `¡Hola! Quisiera hacer el siguiente pedido:\n`;
        message += `\n*N° de Pedido: ${order.id.slice(0, 6)}*\n`;
        message += `*Cliente: ${order.userName}*\n`;

        if (order.address === 'Retiro en local') {
            message += `*Modalidad: Retiro en local*\n`;
        } else if (order.address) {
            message += `*Dirección de Entrega: ${order.address}*\n`;
        }

        if (order.addressDetails) {
            message += `*Detalles: ${order.addressDetails}*\n`;
        }

        if (order.deliveryDate) {
            message += `*Entrega Programada para: ${format(new Date(order.deliveryDate), "eeee d 'de' MMMM 'a las' HH:mm", { locale: es })}hs*\n`;
        }

        message += `\n${order.items
            .map((i) => {
                const optionsString = i.selectedOptions && Object.values(i.selectedOptions).length > 0 ? ` (${Object.values(i.selectedOptions).join(', ')})` : '';
                return `* ${i.name}${optionsString} x ${i.quantity} (${currencySymbol}${(i.finalPrice * i.quantity).toFixed(2)})`
            })
            .join('\n')}\n`
        
        message += `\n*Subtotal: ${currencySymbol}${order.subtotal.toFixed(2)}*\n*Envío: ${currencySymbol}${order.deliveryCost.toFixed(2)}*\n*Total: ${currencySymbol}${order.total.toFixed(2)}*`
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
        
        // Redirect to tracking page after a short delay
        setTimeout(() => {
            router.push(`/order/${order.id}`);
        }, 500);
    };

    return (
        <Button onClick={sendWhatsApp} size="lg" className="w-full rounded-full text-lg py-7 bg-green-500 hover:bg-green-600 text-white">
            Confirmar y Enviar por WhatsApp
        </Button>
    )
};


export default function OrderConfirmationPage() {
  const params = useParams();
  const { toast } = useToast();
  
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      };

      setLoading(true);
      try {
        const [fetchedOrder, fetchedSettings] = await Promise.all([
          fetchOrderById(orderId),
          fetchRestaurantSettings()
        ]);
        setOrder(fetchedOrder);
        setSettings(fetchedSettings);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el pedido.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    getData();
  }, [orderId, toast]);

  if (loading) {
    return (
       <div className="flex flex-col min-h-screen bg-background pb-28">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando confirmación...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!order) {
    return (
       <div className="flex flex-col min-h-screen bg-background pb-28">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
             <div className="text-center py-20">
                <Package className="mx-auto h-24 w-24 text-muted-foreground" />
                <h2 className="mt-6 text-2xl font-semibold">Pedido no encontrado</h2>
                <p className="mt-2 text-muted-foreground">
                    No pudimos encontrar el pedido que buscas.
                </p>
            </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center mb-6">
            <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold">¡Pedido Creado con Éxito!</h1>
            <p className="text-muted-foreground">
                Tu pedido #{order.id.slice(0,6)} ha sido registrado. Por favor, confírmalo por WhatsApp.
            </p>
        </div>

        <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20 overflow-hidden">
            <CardHeader className="p-4">
                <CardTitle className="text-lg font-bold">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="p-4 border-t border-b">
                <ul className="space-y-2">
                    {order.items.map((item, index) => (
                        <li key={`${item.id}-${index}`} className="flex justify-between text-sm p-2 rounded-lg bg-muted/30">
                        <div>
                            <span className='font-semibold'>{item.name}</span>
                            <span className='text-muted-foreground'> x {item.quantity}</span>
                            {item.selectedOptions && Object.values(item.selectedOptions).length > 0 && <p className='text-xs text-muted-foreground italic'>({Object.values(item.selectedOptions).join(', ')})</p>}
                        </div>
                        <span className='font-medium'>{currencySymbol}{(item.finalPrice * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
             <CardFooter className="flex-col items-start gap-2 p-4 bg-muted/20">
                <div className="w-full flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{currencySymbol}{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="w-full flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>{currencySymbol}{order.deliveryCost.toFixed(2)}</span>
                </div>
                <div className="w-full flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{currencySymbol}{order.total.toFixed(2)}</span>
                </div>
            </CardFooter>
        </Card>

        <div className="mt-6">
            <WhatsAppRedirect order={order} settings={settings} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

    