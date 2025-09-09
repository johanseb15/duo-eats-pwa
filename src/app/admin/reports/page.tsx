
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Order, DeliveryPerson, PaymentMethod } from '@/lib/types';
import { fetchAllOrders, fetchDeliveryPersons } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Calendar as CalendarIcon, User, CreditCard, X, ListChecks } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getStatusVariant } from '../orders/OrdersClient';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDays, format, startOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';

const currencySymbol = '$';

export default function ReportsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Filters
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    });
    const [deliveryPersonId, setDeliveryPersonId] = useState<string>('all');
    const [paymentMethod, setPaymentMethod] = useState<string>('all');
    const [orderStatus, setOrderStatus] = useState<string>('all');
    
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [allOrders, allPersons] = await Promise.all([fetchAllOrders(), fetchDeliveryPersons()]);
            setOrders(allOrders);
            setDeliveryPersons(allPersons);
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudieron cargar los datos para los reportes.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = startOfDay(new Date(order.createdAt));
            if (dateRange?.from && startOfDay(dateRange.from) > orderDate) return false;
            if (dateRange?.to && startOfDay(dateRange.to) < orderDate) return false;
            if (deliveryPersonId !== 'all' && order.deliveryPersonId !== deliveryPersonId) return false;
            if (paymentMethod !== 'all' && order.paymentMethod !== paymentMethod) return false;
            if (orderStatus !== 'all' && order.status !== orderStatus) return false;
            return true;
        });
    }, [orders, dateRange, deliveryPersonId, paymentMethod, orderStatus]);

    const analytics = useMemo(() => {
        const relevantOrders = filteredOrders.filter(o => o.status === 'Entregado');
        const totalRevenue = relevantOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = filteredOrders.length;
        const averageOrderValue = relevantOrders.length > 0 ? totalRevenue / relevantOrders.length : 0;
        
        // Cash reconciliation logic
        const cashReconciliation = {
            totalOrders: 0,
            totalCash: 0,
            totalCard: 0,
            totalMP: 0,
            totalGeneral: 0,
        };

        if (deliveryPersonId !== 'all') {
            const personDeliveredOrders = filteredOrders.filter(o => o.status === 'Entregado' && o.deliveryPersonId === deliveryPersonId);
            cashReconciliation.totalOrders = personDeliveredOrders.length;
            personDeliveredOrders.forEach(order => {
                cashReconciliation.totalGeneral += order.total;
                switch (order.paymentMethod) {
                    case 'Efectivo':
                        cashReconciliation.totalCash += order.total;
                        break;
                    case 'Tarjeta (POS)':
                        cashReconciliation.totalCard += order.total;
                        break;
                    case 'Mercado Pago (QR/Link)':
                        cashReconciliation.totalMP += order.total;
                        break;
                }
            });
        }
        
        return { totalRevenue, totalOrders, averageOrderValue, cashReconciliation };
    }, [filteredOrders, deliveryPersonId]);

    const clearFilters = () => {
        setDateRange({ from: addDays(new Date(), -7), to: new Date() });
        setDeliveryPersonId('all');
        setPaymentMethod('all');
        setOrderStatus('all');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" text="Generando reportes..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Filtros de Reporte</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                    {format(dateRange.from, "LLL dd, y", {locale: es})} -{" "}
                                    {format(dateRange.to, "LLL dd, y", {locale: es})}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y", {locale: es})
                                )
                                ) : (
                                <span>Elige una fecha</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            locale={es}
                        />
                        </PopoverContent>
                    </Popover>
                    <Select value={deliveryPersonId} onValueChange={setDeliveryPersonId}>
                        <SelectTrigger>
                            <User className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Repartidor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los repartidores</SelectItem>
                            {deliveryPersons.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los métodos</SelectItem>
                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                            <SelectItem value="Mercado Pago (QR/Link)">Mercado Pago</SelectItem>
                            <SelectItem value="Tarjeta (POS)">Tarjeta (POS)</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={orderStatus} onValueChange={setOrderStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Estado del pedido" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="Pendiente">Pendiente</SelectItem>
                            <SelectItem value="En preparación">En preparación</SelectItem>
                            <SelectItem value="En camino">En camino</SelectItem>
                            <SelectItem value="Entregado">Entregado</SelectItem>
                            <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Limpiar Filtros
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos (Entregados)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currencySymbol}{analytics.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                 <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Filtrados</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{analytics.totalOrders}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currencySymbol}{analytics.averageOrderValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>
            
             {deliveryPersonId !== 'all' && (
                <Card className="shadow-lg rounded-2xl bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <ListChecks className="h-6 w-6 text-primary" />
                            Cuadre de Caja para {deliveryPersons.find(p => p.id === deliveryPersonId)?.name}
                        </CardTitle>
                        <CardDescription>Resumen de los pedidos entregados por el repartidor seleccionado para el rango de fechas elegido.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-background/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Pedidos Entregados</p>
                            <p className="text-2xl font-bold">{analytics.cashReconciliation.totalOrders}</p>
                        </div>
                        <div className="p-4 bg-background/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Efectivo</p>
                            <p className="text-2xl font-bold">{currencySymbol}{analytics.cashReconciliation.totalCash.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-background/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Tarjeta/MP</p>
                            <p className="text-2xl font-bold">{currencySymbol}{(analytics.cashReconciliation.totalCard + analytics.cashReconciliation.totalMP).toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-background/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total General</p>
                            <p className="text-2xl font-bold">{currencySymbol}{analytics.cashReconciliation.totalGeneral.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Repartidor</TableHead>
                            <TableHead>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <Badge variant="secondary">#{order.id.slice(0, 6)}</Badge>
                                </TableCell>
                                <TableCell>{order.userName}</TableCell>
                                <TableCell>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                                <TableCell>
                                    <Badge className={`${getStatusVariant(order.status)} text-white`}>{order.status}</Badge>
                                </TableCell>
                                <TableCell>{order.deliveryPersonName || 'N/A'}</TableCell>
                                <TableCell className="font-bold">{currencySymbol}{order.total.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredOrders.length === 0 && (
                    <p className="text-center text-muted-foreground p-10">No se encontraron pedidos con los filtros aplicados.</p>
                )}
            </div>

        </div>
    );
}
