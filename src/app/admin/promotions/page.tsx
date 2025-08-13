
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Promotion } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
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
import { PromotionForm } from '@/components/PromotionForm';
import { useToast } from '@/hooks/use-toast';
import { deletePromotion } from '@/app/actions';

async function getPromotions(): Promise<Promotion[]> {
  const promotionsCol = collection(db, 'promotions');
  const promotionsSnapshot = await getDocs(promotionsCol);
  const promotionList = promotionsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      image: data.image,
      aiHint: data.aiHint,
    } as Promotion;
  });
  return promotionList;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const { toast } = useToast();

  const loadPromotions = async () => {
    setLoading(true);
    const allPromotions = await getPromotions();
    setPromotions(allPromotions);
    setLoading(false);
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    toast({
      title: selectedPromotion ? "Promoción actualizada" : "Promoción añadida",
      description: `La promoción se ha ${selectedPromotion ? 'actualizado' : 'guardado'} correctamente.`,
    });
    setSelectedPromotion(null);
    loadPromotions();
  }
  
  const handleEditClick = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsAlertOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedPromotion) return;
    const result = await deletePromotion(selectedPromotion.id);
    if (result.success) {
      toast({
        title: "Promoción eliminada",
        description: "La promoción ha sido eliminada.",
      });
      loadPromotions();
    } else {
       toast({
        title: "Error",
        description: "No se pudo eliminar la promoción.",
        variant: "destructive",
      });
    }
    setIsAlertOpen(false);
    setSelectedPromotion(null);
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedPromotion(null);
    }
    setIsFormOpen(open);
  }

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
        <h2 className="text-2xl font-bold">Promociones</h2>
         <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Añadir Promoción</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedPromotion ? 'Editar Promoción' : 'Añadir Nueva Promoción'}</DialogTitle>
              <DialogDescription>
                {selectedPromotion ? 'Modifica los detalles de la promoción.' : 'Rellena los detalles de la nueva promoción.'}
              </DialogDescription>
            </DialogHeader>
            <PromotionForm 
              onPromotionSubmit={handleFormSubmit}
              promotion={selectedPromotion}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell>
                  <Image
                    src={promotion.image}
                    alt={promotion.title}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{promotion.title}</TableCell>
                <TableCell>
                  {promotion.description}
                </TableCell>
                <TableCell className="text-right">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(promotion)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(promotion)} className="text-destructive focus:text-destructive">
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
              la promoción "{selectedPromotion?.title}".
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
