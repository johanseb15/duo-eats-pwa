
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, FileText, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const orders = [
  {
    id: '#3456',
    date: '12 de agosto, 2024',
    total: 54.98,
    status: 'Entregado',
    items: [
      { name: 'Pizza Margherita (Mediana)', quantity: 1 },
      { name: 'Hamburguesa Clásica', quantity: 1 },
    ],
  },
  {
    id: '#3455',
    date: '10 de agosto, 2024',
    total: 25.99,
    status: 'Cancelado',
    items: [{ name: 'Pizza Margherita (Personal)', quantity: 1 }],
  },
   {
    id: '#3454',
    date: '5 de agosto, 2024',
    total: 30.50,
    status: 'Entregado',
    items: [
        { name: 'Ensalada César', quantity: 1 },
        { name: 'Pastel de Chocolate', quantity: 1}
    ],
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Entregado':
      return 'bg-green-500';
    case 'Cancelado':
      return 'bg-red-500';
    default:
      return 'bg-yellow-500';
  }
};

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
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
            <h2 className="mt-6 text-2xl font-semibold">No tienes pedidos</h2>
            <p className="mt-2 text-muted-foreground">
              Empieza a ordenar para ver tu historial aquí.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <a href="/">Comenzar a ordenar</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-md rounded-2xl bg-card/60 backdrop-blur-xl border-white/20 overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-center p-4">
                  <div>
                    <CardTitle className="text-lg font-bold">Pedido {order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <Badge className={`${getStatusVariant(order.status)} text-white`}>{order.status}</Badge>
                </CardHeader>
                <CardContent className="p-4 border-t border-b">
                   <ul className="space-y-1 text-sm text-foreground">
                    {order.items.map(item => (
                        <li key={item.name} className="flex justify-between">
                            <span>{item.name}</span>
                            <span>x{item.quantity}</span>
                        </li>
                    ))}
                   </ul>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4">
                  <p className="text-lg font-bold">Total: S/. {order.total.toFixed(2)}</p>
                  <Button variant="outline" className="rounded-full">
                    <Repeat className="mr-2 h-4 w-4" /> Volver a pedir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
