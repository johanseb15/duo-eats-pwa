
'use client';

import { useEffect, useState, useTransition, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Power, Loader2, Bike, History, Wallet, Package } from 'lucide-react';
import type { DeliveryPerson, Order } from '@/lib/types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { fetchAssignedOrders, fetchCompletedOrdersForDeliveryPerson } from '../actions';
import { AssignedOrderCard } from '@/components/AssignedOrderCard';
import { isToday } from 'date-fns';

const currencySymbol = '$';

async function getDeliveryPerson(uid: string): Promise<DeliveryPerson | null> {
    if (!uid) return null;
    try {
        const personRef = doc(db, 'deliveryPersons', uid);
        const docSnap = await getDoc(personRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as DeliveryPerson;
        }
        return null;
    } catch (error) {
        console.error("Error fetching delivery person data:", error);
        return null;
    }
}

async function updateDeliveryPersonStatus(uid: string, status: 'active' | 'inactive') {
    if (!uid) return { success: false, error: 'User ID is missing' };
    try {
        const personRef = doc(db, 'deliveryPersons', uid);
        await updateDoc(personRef, { status });
        return { success: true };
    } catch (error) {
        console.error("Error updating status:", error);
        return { success: false, error: 'Failed to update status' };
    }
}


export default function DeliveryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, startStatusUpdate] = useTransition();

   const loadData = async (person: DeliveryPerson | null) => {
        if (!person) return;
        try {
            const [assigned, completed] = await Promise.all([
                fetchAssignedOrders(person.id),
                fetchCompletedOrdersForDeliveryPerson(person.id)
            ]);
            setAssignedOrders(assigned);
            setCompletedOrders(completed);
        } catch (err) {
            toast({ title: 'Error', description: 'No se pudieron cargar los pedidos asignados.', variant: 'destructive'});
        }
  };


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    const fetchPersonData = async () => {
        setLoading(true);
        const person = await getDeliveryPerson(user.uid);
        setDeliveryPerson(person);
        if(person) {
            await loadData(person);
        }
        setLoading(false);
    };

    fetchPersonData();
     // Set up a polling interval to refresh data every 30 seconds
    const interval = setInterval(() => {
        if(deliveryPerson) {
             loadData(deliveryPerson);
        }
    }, 30000);

    return () => clearInterval(interval);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);
  
  const { completedToday, totalCollectedToday } = useMemo(() => {
      const todayOrders = completedOrders.filter(order => isToday(new Date(order.createdAt)));
      const total = todayOrders.reduce((sum, order) => sum + order.total, 0);
      return {
          completedToday: todayOrders,
          totalCollectedToday: total
      };
  }, [completedOrders]);

  const handleStatusChange = (isActive: boolean) => {
    if (!deliveryPerson) return;
    const newStatus = isActive ? 'active' : 'inactive';
    
    startStatusUpdate(async () => {
        const result = await updateDeliveryPersonStatus(deliveryPerson.id, newStatus);
        if(result.success) {
            setDeliveryPerson(prev => prev ? { ...prev, status: newStatus } : null);
            toast({
                title: `Estado actualizado a: ${isActive ? 'Activo' : 'Inactivo'}`,
                description: isActive ? 'Estás listo para recibir pedidos.' : 'No recibirás nuevos pedidos.',
            })
        } else {
             toast({
                title: 'Error',
                description: 'No se pudo actualizar tu estado. Inténtalo de nuevo.',
                variant: 'destructive'
            })
        }
    })

  }
  
  const handleOrderUpdate = async () => {
      // Reload data after an order status is changed by the card
      await loadData(deliveryPerson);
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!deliveryPerson) {
      return (
           <Card className="border-destructive">
             <CardHeader>
                <CardTitle>Acceso de Repartidor Requerido</CardTitle>
                <CardDescription>
                    Tu cuenta de usuario no está registrada como repartidor. Por favor, contacta al administrador del sistema.
                </CardDescription>
             </CardHeader>
           </Card>
      )
  }

  const isActive = deliveryPerson.status === 'active';

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">Portal del Repartidor</h1>
            <p className="text-muted-foreground">Bienvenido, {deliveryPerson.name.split(' ')[0]}.</p>
        </div>

        <Card className={cn("transition-all", isActive ? 'border-green-500 bg-green-500/10' : 'border-border')}>
            <CardHeader>
                <CardTitle>Gestión de Disponibilidad</CardTitle>
                <CardDescription>Actívate para que puedan asignarte nuevos pedidos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                    <Power className={cn("h-8 w-8 transition-colors", isActive ? 'text-green-500' : 'text-destructive')} />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                        Estado Actual: {isActive ? 'Activo' : 'Inactivo'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                        {isActive ? 'Listo para recibir entregas.' : 'No estás recibiendo pedidos.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isUpdatingStatus && <Loader2 className="h-5 w-5 animate-spin"/>}
                        <Switch
                            checked={isActive}
                            onCheckedChange={handleStatusChange}
                            disabled={isUpdatingStatus}
                            aria-label="Toggle delivery status"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Resumen de Hoy</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-card/50 rounded-lg">
                    <Package className="h-8 w-8 mb-2 text-primary" />
                    <p className="text-2xl font-bold">{completedToday.length}</p>
                    <p className="text-sm text-muted-foreground">Pedidos Completados</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-card/50 rounded-lg">
                    <Wallet className="h-8 w-8 mb-2 text-primary" />
                    <p className="text-2xl font-bold">{currencySymbol}{totalCollectedToday.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Recaudado</p>
                </div>
            </CardContent>
        </Card>
        
        <Separator/>

        <div>
            <div className="flex items-center gap-3 mb-4">
                 <Bike className="h-6 w-6"/>
                 <h2 className="text-2xl font-bold">Mis Pedidos Asignados ({assignedOrders.length})</h2>
            </div>
             <div className="space-y-4">
                {assignedOrders.length > 0 ? (
                    assignedOrders.map(order => (
                        <AssignedOrderCard key={order.id} order={order} onUpdate={handleOrderUpdate} />
                    ))
                ) : (
                    <div className="text-center py-10 bg-card/50 rounded-2xl border-dashed border-2">
                         <p className="text-muted-foreground">No tienes pedidos asignados por el momento.</p>
                    </div>
                )}
            </div>
        </div>

        <Separator/>
        
        <div>
            <div className="flex items-center gap-3 mb-4">
                 <History className="h-6 w-6"/>
                 <h2 className="text-2xl font-bold">Historial de Hoy ({completedToday.length})</h2>
            </div>
             <div className="space-y-4">
                {completedToday.length > 0 ? (
                    completedToday.map(order => (
                        <AssignedOrderCard key={order.id} order={order} onUpdate={handleOrderUpdate} isHistory />
                    ))
                ) : (
                    <div className="text-center py-10 bg-card/50 rounded-2xl border-dashed border-2">
                         <p className="text-muted-foreground">Aún no has completado ninguna entrega hoy.</p>
                    </div>
                )}
            </div>
        </div>

    </div>
  );
}
