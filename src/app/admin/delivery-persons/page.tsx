
'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import type { DeliveryPerson } from '@/lib/types';
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
import { deleteDeliveryPerson } from '@/app/actions';
import { Badge } from '@/components/ui/badge';

const DeliveryPersonForm = lazy(() => import('@/components/DeliveryPersonForm').then(module => ({ default: module.DeliveryPersonForm })));

async function getDeliveryPersons(): Promise<DeliveryPerson[]> {
  const personsCol = collection(db, 'deliveryPersons');
  const q = query(personsCol, orderBy('name'));
  const snapshot = await getDocs(q);
  const personList = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as DeliveryPerson));
  return personList;
}

export default function AdminDeliveryPersonsPage() {
  const [persons, setPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<DeliveryPerson | null>(null);
  const { toast } = useToast();

  const loadPersons = async () => {
    setLoading(true);
    try {
        const allPersons = await getDeliveryPersons();
        setPersons(allPersons);
    } catch (error) {
        console.error("Failed to load delivery persons:", error);
        toast({ title: "Error", description: "No se pudieron cargar los repartidores.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadPersons();
  }, []);

  const handleFormSubmit = async () => {
    setIsFormOpen(false);
    toast({
      title: selectedPerson ? "Repartidor actualizado" : "Repartidor añadido",
      description: `El repartidor se ha ${selectedPerson ? 'actualizado' : 'guardado'} correctamente.`,
    });
    setSelectedPerson(null);
    await loadPersons();
  }
  
  const handleEditClick = (person: DeliveryPerson) => {
    setSelectedPerson(person);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (person: DeliveryPerson) => {
    setSelectedPerson(person);
    setIsAlertOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedPerson) return;
    const result = await deleteDeliveryPerson(selectedPerson.id);
    if (result.success) {
      toast({
        title: "Repartidor eliminado",
        description: "El repartidor ha sido eliminado.",
      });
      await loadPersons();
    } else {
       toast({
        title: "Error",
        description: result.error || "No se pudo eliminar al repartidor.",
        variant: "destructive",
      });
    }
    setIsAlertOpen(false);
    setSelectedPerson(null);
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedPerson(null);
    }
    setIsFormOpen(open);
  }

  const FormSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
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
        <h2 className="text-2xl font-bold">Repartidores ({persons.length})</h2>
         <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Añadir Repartidor</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedPerson ? 'Editar Repartidor' : 'Añadir Nuevo Repartidor'}</DialogTitle>
              <DialogDescription>
                {selectedPerson ? 'Modifica los detalles del repartidor.' : 'Crea un nuevo repartidor en el sistema.'}
              </DialogDescription>
            </DialogHeader>
            <Suspense fallback={<FormSkeleton />}>
              <DeliveryPersonForm 
                onFormSubmit={handleFormSubmit}
                person={selectedPerson}
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
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {persons.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell>{person.phone}</TableCell>
                <TableCell>
                  <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                    {person.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(person)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(person)} className="text-destructive focus:text-destructive">
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
         {persons.length === 0 && (
          <div className="text-center p-10">
            <p className="text-muted-foreground">No hay repartidores registrados.</p>
          </div>
        )}
      </div>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              a "{selectedPerson?.name}" del sistema.
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
