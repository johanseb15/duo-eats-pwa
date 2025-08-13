
'use client';

import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { fetchAllOrders, updateOrderStatus } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const currencySymbol = '$';
const orderStatuses: Order['status'][] = [
  'Pendiente',
  'En preparación',
  'En camino',
  'Entregado',
  'Cancelado',
];

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    const allOrders = await fetchAllOrders();
    setOrders(allOrders);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    // Optional: set up polling to refresh orders periodically
    const interval = setInterval(loadOrders, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      toast({
        title: 'Estado actualizado',
        description: `El pedido #${orderId.slice(0, 6)} ahora está ${newStatus}.`,
      });
      // Update local state to reflect the change immediately
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } else {
      toast({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el estado del pedido.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
       <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pedidos Recibidos</h2>
        <Button onClick={loadOrders} disabled={loading} size="sm">Refrescar</Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No hay pedidos</h2>
          <p className="mt-2 text-muted-foreground">
            Cuando un cliente haga un pedido, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">Pedido #{order.id.slice(0, 6)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {order.userName}
                  </p>
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
              <CardContent>
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
                  <div className="border-t my-2 pt-2 space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Subtotal</span>
                      <span>{currencySymbol}{order.subtotal.toFixed(2)}</span>
                    </div>
                      <div className="flex justify-between text-sm font-medium">
                      <span>Envío</span>
                      <span>{currencySymbol}{order.deliveryCost.toFixed(2)}</span>
                    </div>
                      <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{currencySymbol}{order.total.toFixed(2)}</span>
                    </div>
                  </div>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2 justify-end items-center bg-muted/20 p-4">
                  <p className="text-sm font-medium">Actualizar estado:</p>
                  <Select
                    value={order.status}
                    onValueChange={(newStatus: Order['status']) => handleStatusChange(order.id, newStatus)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Cambiar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
