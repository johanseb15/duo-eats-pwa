

'use client';

import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, FileText, Loader2, MessageSquareQuote, Wallet, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Order } from '@/lib/types';
import { useEffect, useState } from 'react';
import { fetchOrderById } from '../../actions';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

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

const getStatusProgress = (status: Order['status']): number => {
    switch (status) {
        case 'Pendiente':
            return 10;
        case 'En preparación':
            return 40;
        case 'En camino':
            return 75;
        case 'Entregado':
            return 100;
        case 'Cancelado':
            return 0;
        default:
            return 0;
    }
}

const getPaymentIcon = (method: Order['paymentMethod']) => {
    switch (method) {
        case 'Efectivo':
            return <Wallet className="h-4 w-4" />;
        case 'Tarjeta (POS)':
            return <CreditCard className="h-4 w-4" />;
        case 'Mercado Pago (QR/Link)':
            return <Image src="/mp.svg" alt="Mercado Pago" width={16} height={16} />;
        default:
            return <Wallet className="h-4 w-4" />;
    }
}


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
  
  const progressValue = getStatusProgress(order.status);

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
            <CardHeader className="flex flex-col gap-4 p-4">
              <div className="flex flex-row justify-between items-center">
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
              </div>
                {order.status !== 'Cancelado' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-muted-foreground">Progreso</p>
                      <p className="text-sm font-bold text-primary">{progressValue}%</p>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>
                )}
            </CardHeader>
            <CardContent className="p-4 border-t border-b">
             {order.status === 'Cancelado' ? (
                <div className="text-center py-4">
                  <p className="font-semibold text-destructive">Este pedido fue cancelado.</p>
                  {order.cancellationReason && <p className="text-sm text-muted-foreground mt-1">Motivo: {order.cancellationReason}</p>}
                </div>
              ) : (
                <>
                    <h4 className="font-semibold mb-2">Resumen del pedido:</h4>
                    <ul className="space-y-3">
                        {order.items.map((item, index) => (
                            <li key={`${item.id}-${index}`} className="flex justify-between text-sm p-2 rounded-lg bg-muted/30">
                            <div>
                                <span className='font-semibold'>{item.name}</span>
                                <span className='text-muted-foreground'> x {item.quantity}</span>
                                {item.selectedOptions && Object.values(item.selectedOptions).length > 0 && <p className='text-xs text-muted-foreground italic'>({Object.values(item.selectedOptions).join(', ')})</p>}
                                {item.notes && (
                                    <div className="flex items-start gap-2 mt-1 text-xs text-amber-600 dark:text-amber-400">
                                        <MessageSquareQuote className="h-3 w-3 mt-0.5 flex-shrink-0"/>
                                        <p className="italic">{item.notes}</p>
                                    </div>
                                )}
                            </div>
                            <span className='font-medium'>{currencySymbol}{(item.finalPrice * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                </>
              )}
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
                 <div className="w-full flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                        {getPaymentIcon(order.paymentMethod)}
                        Método de Pago
                    </span>
                    <span className="font-semibold">{order.paymentMethod}</span>
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

