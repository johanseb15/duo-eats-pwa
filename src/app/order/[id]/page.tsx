
'use client';

import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Order } from '@/lib/types';
import { useEffect, useState } from 'react';
import { fetchOrderById } from '../../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const currencySymbol = '$';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Entregado':
      return 'bg-green-500';
    case 'Cancelado':
      return 'bg-red-500';
    case 'En preparación':
      return 'bg-blue-500';
    case 'En camino':
      return 'bg-orange-500';
    default:
      return 'bg-yellow-500';
  }
};

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      };

      setLoading(true);
      try {
        const fetchedOrder = await fetchOrderById(orderId);
        setOrder(fetchedOrder);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el pedido.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    getOrder();

    const interval = setInterval(getOrder, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [orderId, toast]);

  if (loading) {
    return (
       <div className="flex flex-col min-h-screen bg-background pb-28">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Buscando tu pedido...</p>
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
                <FileText className="mx-auto h-24 w-24 text-muted-foreground" />
                <h2 className="mt-6 text-2xl font-semibold">Pedido no encontrado</h2>
                <p className="mt-2 text-muted-foreground">
                    No pudimos encontrar el pedido que buscas. Verifica el enlace o vuelve al inicio.
                </p>
                <Button asChild className="mt-6 rounded-full">
                    <Link href="/">Volver al inicio</Link>
                </Button>
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
        <div className="relative flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push('/')}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold text-center flex-grow">Seguimiento de Pedido</h1>
            <div className="w-10"></div> {/* Spacer */}
        </div>

        <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20 overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center p-4">
            <div>
                <CardTitle className="text-lg font-bold">Pedido #{order.id.slice(0, 6)}</CardTitle>
                <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                </p>
            </div>
            <Badge className={`${getStatusVariant(order.status)} text-white`}>{order.status}</Badge>
            </CardHeader>
            <CardContent className="p-4 border-t border-b">
            <h4 className="font-semibold mb-2">Resumen del pedido:</h4>
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
      </main>
      <BottomNav />
    </div>
  );
}
