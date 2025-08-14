
'use client';

import { useEffect, useState, useMemo, useTransition } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Search, Loader2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const currencySymbol = '$';
const orderStatuses: Order['status'][] = [
  'Pendiente',
  'En preparación',
  'En camino',
  'Entregado',
  'Cancelado',
];

export const getStatusVariant = (status: string) => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'Todos'>('Todos');
  const [isUpdating, startUpdateTransition] = useTransition();

  // State for cancellation dialog
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const { toast } = useToast();

  const loadOrders = async () => {
    if (!loading) setLoading(true);
    try {
        const allOrders = await fetchAllOrders();
        setOrders(allOrders);
    } catch (error) {
        console.error("Failed to load orders:", error);
        toast({
            title: 'Error de Red',
            description: 'No se pudieron cargar los pedidos. Revisa tu conexión.',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);


  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    startUpdateTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast({
          title: 'Estado actualizado',
          description: `El pedido #${orderId.slice(0, 6)} ahora está ${newStatus}.`,
        });
        await loadOrders();
      } else {
        toast({
          title: 'Error al actualizar',
          description: 'No se pudo actualizar el estado del pedido.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleCancellationConfirm = () => {
    if (!orderToCancel) return;

    startUpdateTransition(async () => {
        const result = await updateOrderStatus(orderToCancel.id, 'Cancelado', cancellationReason);
        if (result.success) {
            toast({
                title: 'Pedido Cancelado',
                description: `El pedido #${orderToCancel.id.slice(0, 6)} ha sido cancelado.`,
            });
            await loadOrders();
        } else {
            toast({
                title: 'Error al cancelar',
                description: 'No se pudo cancelar el pedido.',
                variant: 'destructive',
            });
        }
        setIsCancelAlertOpen(false);
        setOrderToCancel(null);
        setCancellationReason('');
    });
  }

  const onStatusSelect = (order: Order, newStatus: Order['status']) => {
      if (newStatus === 'Cancelado') {
          setOrderToCancel(order);
          setIsCancelAlertOpen(true);
      } else {
          handleStatusChange(order.id, newStatus);
      }
  }


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
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold shrink-0">Pedidos ({filteredOrders.length})</h2>
         <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Buscar..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <Button onClick={() => loadOrders()} disabled={loading} size="sm">Refrescar</Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No hay pedidos</h2>
          <p className="mt-2 text-muted-foreground">
            Cuando un cliente haga un pedido, aparecerá aquí.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
         <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No se encontraron pedidos</h2>
          <p className="mt-2 text-muted-foreground">
            Prueba con otro término de búsqueda o filtro de estado.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
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
                   {order.deliveryDate && (
                    <p className="text-sm text-primary font-bold flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      Programado: {format(new Date(order.deliveryDate), "d/MM/yy HH:mm", { locale: es })}hs
                    </p>
                  )}
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
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && <p className='text-xs text-muted-foreground italic'>({Object.values(item.selectedOptions).join(', ')})</p>}
                      </div>
                      <span className='font-medium'>{currencySymbol}{(item.finalPrice * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                
                {order.address && order.address !== 'Retiro en local' && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{order.address}</p>
                                {order.addressDetails && <p className="text-sm text-muted-foreground italic">{order.addressDetails}</p>}
                            </div>
                        </div>
                    </div>
                )}


                {order.cancellationReason && (
                    <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                        <p className="text-sm font-bold text-destructive">Motivo de cancelación:</p>
                        <p className="text-sm text-destructive/90">{order.cancellationReason}</p>
                    </div>
                )}
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
                    onValueChange={(newStatus: Order['status']) => onStatusSelect(order, newStatus)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      {isUpdating ? <Loader2 className="animate-spin mr-2"/> : <SelectValue placeholder="Cambiar estado" />}
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
        <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
                <AlertDialogDescription>
                Por favor, introduce un motivo para la cancelación del pedido #{orderToCancel?.id.slice(0,6)}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
                placeholder="Ej: Falta de stock, error en el pedido, etc."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                disabled={isUpdating}
            />
            <AlertDialogFooter>
                <AlertDialogCancel>Cerrar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancellationConfirm} disabled={!cancellationReason || isUpdating} className="bg-destructive hover:bg-destructive/90">
                 {isUpdating && <Loader2 className="animate-spin mr-2"/>}
                 Confirmar Cancelación
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
