
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, FileText, Repeat, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Order } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, Suspense } from 'react';
import { fetchOrdersByUserId, fetchOrderById } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/store/cart';
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

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const guestOrderId = searchParams.get('orderId');

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true);
      try {
        let fetchedOrders: Order[] = [];
        if (guestOrderId) {
            // Guest user or logged-in user just placed an order
            const singleOrder = await fetchOrderById(guestOrderId);
            if (singleOrder) {
                fetchedOrders.push(singleOrder);
            }
        } else if (user) {
            // Logged-in user viewing their history
            fetchedOrders = await fetchOrdersByUserId(user.uid);
        } else if (!authLoading) {
            // Guest user with no specific order ID, redirect to sign-in
            router.push('/auth/signin');
            return;
        }
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast({
          title: 'Error de Red',
          description: 'No se pudieron cargar tus pedidos. Revisa tu conexión.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Run fetch logic only when auth is resolved
    if (!authLoading) {
        getOrders();
    }
    
    const interval = setInterval(() => {
        if (!authLoading) getOrders();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [user, authLoading, guestOrderId, router, toast]);

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item)
    });
    toast({
      title: '¡Pedido añadido al carrito!',
      description: 'Los artículos del pedido anterior se han añadido a tu carrito.',
    });
    router.push('/cart');
  };

  if (authLoading || loading) {
    return (
      <>
        <div className="relative flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-7 w-32 mx-auto" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="relative flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-center flex-grow">Mis Pedidos</h1>
          <div className="w-10"></div> {/* Spacer */}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
           <FileText className="mx-auto h-24 w-24 text-muted-foreground" />
          <h2 className="mt-6 text-2xl font-semibold">{guestOrderId ? "Pedido no encontrado" : "No tienes pedidos"}</h2>
          <p className="mt-2 text-muted-foreground">
            {guestOrderId ? "No pudimos encontrar el pedido que buscas." : "Empieza a ordenar para ver tu historial aquí."}
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link href="/">Comenzar a ordenar</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-md rounded-2xl bg-card/60 backdrop-blur-xl border-white/20 overflow-hidden">
              <CardHeader className="flex flex-row justify-between items-center p-4">
                <div>
                  <CardTitle className="text-lg font-bold">Pedido #{order.id.slice(0, 6)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <Badge className={`${getStatusVariant(order.status)} text-white`}>{order.status}</Badge>
              </CardHeader>
              <CardContent className="p-4 border-t border-b">
                 <ul className="space-y-1 text-sm text-foreground">
                  {order.items.map((item, index) => (
                      <li key={`${item.id}-${index}`} className="flex justify-between">
                          <span>{item.name} {item.selectedOptions && Object.values(item.selectedOptions).length > 0 && `(${Object.values(item.selectedOptions).join(', ')})`}</span>
                          <span>x{item.quantity}</span>
                      </li>
                  ))}
                 </ul>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4">
                <p className="text-lg font-bold">Total: {currencySymbol} {order.total.toFixed(2)}</p>
                <Button variant="outline" className="rounded-full" onClick={() => handleReorder(order)}>
                  <Repeat className="mr-2 h-4 w-4" /> Volver a pedir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <div className="flex flex-col min-h-screen bg-background pb-28">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-6">
                    <OrdersContent />
                </main>
                <BottomNav />
            </div>
        </Suspense>
    )
}
