
'use client';

import { useState, useTransition } from 'react';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { MapPin, MessageSquareQuote, Navigation, Wallet, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateOrder } from '@/app/actions';
import Image from 'next/image';

const currencySymbol = '$';
const deliveryStatuses: Order['status'][] = ['En camino', 'Entregado'];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Entregado':
      return 'bg-green-500';
    case 'En camino':
      return 'bg-orange-500';
    default:
      return 'bg-blue-500';
  }
};

const getPaymentIcon = (method: Order['paymentMethod']) => {
    switch (method) {
        case 'Efectivo':
            return <Wallet className="h-5 w-5" />;
        case 'Tarjeta (POS)':
            return <CreditCard className="h-5 w-5" />;
        case 'Mercado Pago (QR/Link)':
            return <Image src="/mp.svg" alt="Mercado Pago" width={20} height={20} />;
        default:
            return <Wallet className="h-5 w-5" />;
    }
}

interface AssignedOrderCardProps {
    order: Order;
    onUpdate: () => Promise<void>;
}

export function AssignedOrderCard({ order, onUpdate }: AssignedOrderCardProps) {
    const { toast } = useToast();
    const [isUpdating, startUpdateTransition] = useTransition();
    const [isConfirmAlertOpen, setIsConfirmAlertOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Order['status'] | null>(null);

    const performStatusUpdate = (newStatus: Order['status']) => {
        startUpdateTransition(async () => {
            const updateData: Partial<Order> = { status: newStatus };
            if (newStatus === 'Entregado') {
                updateData.paymentConfirmed = true;
            }

            const result = await updateOrder(order.id, updateData);
            if (result.success) {
                toast({
                    title: 'Estado Actualizado',
                    description: `El pedido #${order.id.slice(0,6)} ahora está: ${newStatus}`,
                });
                await onUpdate();
            } else {
                toast({
                    title: 'Error',
                    description: 'No se pudo actualizar el estado del pedido.',
                    variant: 'destructive',
                });
            }
        });
    }

    const handleStatusChange = (newStatus: Order['status']) => {
        setSelectedStatus(newStatus);
        if (newStatus === 'Entregado' && (order.paymentMethod === 'Efectivo' || order.paymentMethod === 'Tarjeta (POS)')) {
            setIsConfirmAlertOpen(true);
        } else {
            performStatusUpdate(newStatus);
        }
    }

    const handleConfirmPayment = () => {
        if (selectedStatus) {
            performStatusUpdate(selectedStatus);
        }
        setIsConfirmAlertOpen(false);
    }

    const openInMaps = () => {
        if (!order.address) return;
        const query = encodeURIComponent(order.address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }

    return (
        <>
            <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold">Pedido #{order.id.slice(0, 6)}</CardTitle>
                        <p className="text-sm text-muted-foreground">Cliente: {order.userName}</p>
                    </div>
                    <Badge className={`${getStatusVariant(order.status)} text-white`}>{order.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    {order.address && order.address !== 'Retiro en local' && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">{order.address}</p>
                                    {order.addressDetails && <p className="text-sm text-muted-foreground italic">{order.addressDetails}</p>}
                                    <Button onClick={openInMaps} size="sm" variant="link" className="p-0 h-auto mt-1">
                                        <Navigation className="mr-2 h-4 w-4" />
                                        Ver en Google Maps
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold mb-2 text-sm">Resumen del pedido:</h4>
                        <ul className="space-y-2 text-sm">
                            {order.items.map((item, index) => (
                                <li key={`${item.id}-${index}`} className="flex justify-between p-2 rounded-lg bg-muted/30">
                                <div>
                                    <span className='font-semibold'>{item.name}</span>
                                    <span className='text-muted-foreground'> x {item.quantity}</span>
                                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && <p className='text-xs text-muted-foreground italic'>({Object.values(item.selectedOptions).join(', ')})</p>}
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
                    </div>

                    <div className="border-t my-2 pt-2 space-y-2">
                        <div className="flex justify-between items-center text-md font-medium">
                            <span className="flex items-center gap-2">
                                {getPaymentIcon(order.paymentMethod)}
                                Método de Pago
                            </span>
                            <span className="font-semibold">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total a Cobrar</span>
                            <span>{currencySymbol}{order.total.toFixed(2)}</span>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex-col gap-2 justify-end items-center bg-muted/20 p-4">
                    <div className="w-full flex sm:flex-row gap-2 justify-between items-center">
                            <p className="text-sm font-medium">Marcar como:</p>
                            <Select
                                value={order.status}
                                onValueChange={(newStatus: Order['status']) => handleStatusChange(newStatus)}
                                disabled={isUpdating}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                {isUpdating ? <Loader2 className="animate-spin mr-2"/> : <SelectValue placeholder="Cambiar estado" />}
                                </SelectTrigger>
                                <SelectContent>
                                {deliveryStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                    </div>
                </CardFooter>
            </Card>
            <AlertDialog open={isConfirmAlertOpen} onOpenChange={setIsConfirmAlertOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Cobro</AlertDialogTitle>
                    <AlertDialogDescription>
                    ¿Confirmas que has recibido el pago de <span className="font-bold">{currencySymbol}{order.total.toFixed(2)}</span> por este pedido?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmPayment}>
                    Sí, he recibido el pago
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
