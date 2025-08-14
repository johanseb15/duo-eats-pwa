'use client';

import { fetchDashboardAnalytics } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { getStatusVariant } from "./orders/page";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { DashboardAnalytics } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const currencySymbol = '$';

const chartConfig = {
    orders: {
        label: "Pedidos",
        color: "hsl(var(--primary))",
    },
    total: {
        label: "Ventas",
        color: "hsl(var(--primary))",
    },
};

const initialAnalytics: DashboardAnalytics = {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    recentOrders: [],
    productSales: [],
    ordersOverTime: []
};

export default function AdminDashboardPage() {
    const [analytics, setAnalytics] = useState<DashboardAnalytics>(initialAnalytics);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAnalytics = async () => {
            setLoading(true);
            const data = await fetchDashboardAnalytics();
            setAnalytics(data);
            setLoading(false);
        }
        getAnalytics();
    }, []);
    
    if (loading) {
        return (
             <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Skeleton className="col-span-4 h-72 rounded-2xl" />
                    <Skeleton className="col-span-4 lg:col-span-3 h-72 rounded-2xl" />
                </div>
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        )
    }


    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales (Entregados)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currencySymbol}{analytics.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Basado en pedidos completados</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{analytics.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Todos los estados de pedido incluidos</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currencySymbol}{analytics.averageOrderValue.toFixed(2)}</div>
                         <p className="text-xs text-muted-foreground">Valor promedio por pedido entregado</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                     <CardHeader>
                        <CardTitle>Pedidos en los Últimos 7 Días</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <LineChart accessibilityLayer data={analytics.ordersOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                <Line dataKey="orders" type="monotone" stroke="var(--color-orders)" strokeWidth={2} dot={true} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card className="col-span-4 lg:col-span-3 rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                    <CardHeader>
                        <CardTitle>Productos Más Vendidos</CardTitle>
                        <CardDescription>Top 5 productos más vendidos en todos los pedidos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={chartConfig} className="h-[250px] w-full">
                             <BarChart accessibilityLayer data={analytics.productSales} layout="vertical" margin={{ left: 0, top: 0, right: 0, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={4} width={120} />
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="total" layout="vertical" fill="var(--color-total)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                    <CardTitle>Pedidos Recientes</CardTitle>
                    <CardDescription>Un vistazo a los 5 pedidos más recientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics.recentOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.userName}</div>
                                        <div className="text-sm text-muted-foreground">#{order.id.slice(0, 6)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${getStatusVariant(order.status)} text-white`}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell>{currencySymbol}{order.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString('es-ES', { month: 'long', day: 'numeric'})}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </div>

        </div>
    )
}
