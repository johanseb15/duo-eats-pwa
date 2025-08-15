

'use client';

import { useEffect, useState, useMemo, useTransition, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Search, Loader2, MapPin, MessageSquareQuote, CreditCard, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


const currencySymbol = '$';
const orderStatuses: Order['status'][] = [
  'Pendiente',
  'En preparación',
  'En camino',
  'Entregado',
  'Cancelado',
];

// Audio notification data URI (simple beep sound)
const notificationSound = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gUmVjb3JkZWQgb24gMjAxOS0wMi0xM1QwODoxNToxNFoAAAAAAAAAADExTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVaxVUleme/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gUmVjb3JkZWQgb24gMjAxOS0wMi0xM1QwODoxNToxNFoAAAAAAAAAADExTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVmV6ZXJ2ZWRCAAAAAEluZm8AAAAPAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-i-";

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

interface OrderColumnProps {
    title: Order['status'];
    orders: Order[];
    onStatusChange: (orderId: string, newStatus: Order['status']) => void;
    onSelectStatus: (order: Order, newStatus: Order['status']) => void;
    isUpdating: boolean;
    isNewOrder?: boolean;
}

const OrderCard = ({ order, onSelectStatus, isUpdating }: { order: Order; onSelectStatus: (order: Order, newStatus: Order['status']) => void; isUpdating: boolean }) => (
     <Card key={order.id} className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20 w-80 shrink-0">
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-lg font-bold">Pedido #{order.id.slice(0, 6)}</CardTitle>
            <p className="text-sm text-muted-foreground">
                Cliente: {order.userName}
            </p>
            <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleString('es-ES', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
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
            <ul className="space-y-3">
            {order.items.map((item, index) => (
                <li key={`${item.id}-${index}`} className="flex justify-between text-sm p-2 rounded-lg bg-muted/30">
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
                <div className="flex justify-between items-center text-sm font-medium">
                    <span className="flex items-center gap-2">
                        {getPaymentIcon(order.paymentMethod)}
                        Método de Pago
                    </span>
                    <span className="font-semibold">{order.paymentMethod}</span>
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
                onValueChange={(newStatus: Order['status']) => onSelectStatus(order, newStatus)}
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
);

const OrderColumn = ({ title, orders, onSelectStatus, isUpdating, isNewOrder }: OrderColumnProps) => (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-center">{title} ({orders.length})</h3>
      <div className={cn(
          "space-y-4 rounded-xl bg-muted/30 p-4 min-h-[300px] transition-all duration-500",
           isNewOrder && "bg-primary/20 animate-pulse-bg"
          )}>
        {orders.map(order => (
          <OrderCard key={order.id} order={order} onSelectStatus={onSelectStatus} isUpdating={isUpdating} />
        ))}
        {orders.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No hay pedidos en este estado.
          </div>
        )}
      </div>
    </div>
  );


interface OrdersClientProps {
    initialOrders: Order[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, startUpdateTransition] = useTransition();

  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isNewOrder, setIsNewOrder] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);


  const { toast } = useToast();

  const loadOrders = async () => {
    try {
        const allOrders = await fetchAllOrders();
        
        // Detect new orders
        const oldPendingIds = new Set(orders.filter(o => o.status === 'Pendiente').map(o => o.id));
        const newPendingOrders = allOrders.filter(o => o.status === 'Pendiente' && !oldPendingIds.has(o.id));

        if (newPendingOrders.length > 0) {
            console.log("New order detected!");
            setIsNewOrder(true);
            audioRef.current?.play().catch(e => console.error("Error playing sound:", e));
            setTimeout(() => setIsNewOrder(false), 3000); // Visual cue for 3 seconds
        }

        setOrders(allOrders);
    } catch (error) {
        console.error("Failed to load orders:", error);
        toast({
            title: 'Error de Red',
            description: 'No se pudieron cargar los pedidos. Revisa tu conexión.',
            variant: 'destructive',
        });
    }
  };

  useEffect(() => {
    const interval = setInterval(loadOrders, 30000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]); // Depend on orders to have the latest list for comparison
  
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
        return o.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                o.id.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [orders, searchTerm]);

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
  
  const ordersByStatus = useMemo(() => {
    const statusMap: { [key in Order['status']]: Order[] } = {
        'Pendiente': [],
        'En preparación': [],
        'En camino': [],
        'Entregado': [],
        'Cancelado': [],
    };
    filteredOrders.forEach(order => {
        if (statusMap[order.status]) {
            statusMap[order.status].push(order);
        }
    });
    return statusMap;
  }, [filteredOrders]);


  return (
    <>
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold shrink-0">Pedidos</h2>
         <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por cliente o ID..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <Button onClick={() => loadOrders()} disabled={isUpdating} size="sm">
          {isUpdating ? <Loader2 className="animate-spin" /> : 'Refrescar'}
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No hay pedidos</h2>
          <p className="mt-2 text-muted-foreground">
            Cuando un cliente haga un pedido, aparecerá aquí.
          </p>
        </div>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap rounded-lg">
            <div className="flex space-x-6 p-1">
                <OrderColumn title="Pendiente" orders={ordersByStatus['Pendiente']} onSelectStatus={onStatusSelect} isUpdating={isUpdating} onStatusChange={handleStatusChange} isNewOrder={isNewOrder} />
                <OrderColumn title="En preparación" orders={ordersByStatus['En preparación']} onSelectStatus={onStatusSelect} isUpdating={isUpdating} onStatusChange={handleStatusChange} />
                <OrderColumn title="En camino" orders={ordersByStatus['En camino']} onSelectStatus={onStatusSelect} isUpdating={isUpdating} onStatusChange={handleStatusChange} />
                <OrderColumn title="Entregado" orders={ordersByStatus['Entregado']} onSelectStatus={onStatusSelect} isUpdating={isUpdating} onStatusChange={handleStatusChange} />
                <OrderColumn title="Cancelado" orders={ordersByStatus['Cancelado']} onSelectStatus={onStatusSelect} isUpdating={isUpdating} onStatusChange={handleStatusChange} />
            </div>
             <ScrollBar orientation="horizontal" />
        </ScrollArea>
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
        <audio ref={audioRef} src={notificationSound} preload="auto" />
    </>
  );
}
