
'use client';

import { useEffect, useState, Suspense, lazy, useTransition } from 'react';
import type { DeliveryZone } from '@/lib/types';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { addDeliveryZone, deleteDeliveryZone, updateDeliveryZone, type DeliveryZoneInput } from '@/app/actions';
import { Badge } from '@/components/ui/badge';

const DeliveryZoneForm = lazy(() => import('@/components/DeliveryZoneForm').then(module => ({ default: module.DeliveryZoneForm })));

async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const zonesCol = collection(db, 'deliveryZones');
  const q = query(zonesCol, orderBy('cost'));
  const snapshot = await getDocs(q);
  const zoneList = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as DeliveryZone));
  return zoneList;
}

const currencySymbol = '$';

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();

  const loadZones = async () => {
    setLoading(true);
    try {
        const allZones = await getDeliveryZones();
        setZones(allZones);
    } catch (error) {
        console.error("Failed to load delivery zones:", error);
        toast({ title: "Error", description: "No se pudieron cargar las zonas de entrega.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleFormSubmit = (values: DeliveryZoneInput) => {
    startTransition(async () => {
      const result = selectedZone
        ? await updateDeliveryZone(selectedZone.id, values)
        : await addDeliveryZone(values);

      if (result.success) {
        toast({
          title: selectedZone ? "Zona actualizada" : "Zona añadida",
          description: "La zona de entrega ha sido guardada.",
        });
        setIsFormOpen(false);
        setSelectedZone(null);
        await loadZones();
      } else {
        toast({
          title: "Error al guardar",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleEditClick = (zone: DeliveryZone) => {
    setSelectedZone(zone);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (zone: DeliveryZone) => {
    setSelectedZone(zone);
    setIsAlertOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedZone) return;
    const result = await deleteDeliveryZone(selectedZone.id);
    if (result.success) {
      toast({
        title: "Zona eliminada",
        description: "La zona de entrega ha sido eliminada.",
      });
      await loadZones();
    } else {
       toast({
        title: "Error",
        description: result.error || "No se pudo eliminar la zona.",
        variant: "destructive",
      });
    }
    setIsAlertOpen(false);
    setSelectedZone(null);
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedZone(null);
    }
    setIsFormOpen(open);
  }

  const FormSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full mt-4" />
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="rounded-2xl border">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Zonas de Entrega ({zones.length})</h2>
         <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Añadir Zona</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedZone ? 'Editar Zona de Entrega' : 'Añadir Nueva Zona'}</DialogTitle>
              <DialogDescription>
                {selectedZone ? 'Modifica los detalles de la zona.' : 'Crea una nueva zona de entrega con su costo y barrios asociados.'}
              </DialogDescription>
            </DialogHeader>
            <Suspense fallback={<FormSkeleton />}>
              <DeliveryZoneForm 
                onSubmit={handleFormSubmit}
                zone={selectedZone}
                isSubmitting={isSubmitting}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barrios</TableHead>
              <TableHead>Costo de envío</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">
                  <div className='flex flex-wrap gap-2 max-w-md'>
                    {zone.neighborhoods.map(n => <Badge key={n} variant="secondary">{n}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>{currencySymbol}{zone.cost.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(zone)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(zone)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {zones.length === 0 && (
          <div className="text-center p-10">
            <p className="text-muted-foreground">No hay zonas de entrega configuradas.</p>
          </div>
        )}
      </div>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la zona de entrega para los barrios: {selectedZone?.neighborhoods.join(', ')}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
