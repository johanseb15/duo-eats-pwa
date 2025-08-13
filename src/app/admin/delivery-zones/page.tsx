
'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
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
import { deleteDeliveryZone } from '@/app/actions';

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

  const loadZones = async () => {
    setLoading(true);
    const allZones = await getDeliveryZones();
    setZones(allZones);
    setLoading(false);
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    toast({
      title: selectedZone ? "Zona de entrega actualizada" : "Zona de entrega añadida",
      description: `La zona se ha ${selectedZone ? 'actualizado' : 'guardado'} correctamente.`,
    });
    setSelectedZone(null);
    loadZones();
  }
  
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
      loadZones();
    } else {
       toast({
        title: "Error",
        description: "No se pudo eliminar la zona.",
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
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Zonas de Entrega</h2>
         <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Añadir Zona</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedZone ? 'Editar Zona de Entrega' : 'Añadir Nueva Zona'}</DialogTitle>
              <DialogDescription>
                {selectedZone ? 'Modifica los detalles de la zona.' : 'Crea una nueva zona de entrega con su costo.'}
              </DialogDescription>
            </DialogHeader>
            <Suspense fallback={<FormSkeleton />}>
              <DeliveryZoneForm 
                onFormSubmit={handleFormSubmit}
                zone={selectedZone}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Costo de envío</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">{zone.name}</TableCell>
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
      </div>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la zona de entrega "{selectedZone?.name}".
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
