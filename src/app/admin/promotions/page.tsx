
'use client';

import { useEffect, useState, Suspense, lazy, useMemo } from 'react';
import Image from 'next/image';
import type { Promotion, Product } from '@/lib/types';
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Search, Link as LinkIcon } from 'lucide-react';
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
import { deletePromotion } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const PromotionForm = lazy(() => import('@/components/PromotionForm').then(module => ({ default: module.PromotionForm })));

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
      productId: data.productId,
    } as Promotion;
  });
  return promotionList;
}

async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const q = query(productsCol, orderBy('name'));
  const productsSnapshot = await getDocs(q);
  const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  return productList;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
        const [allPromotions, allProducts] = await Promise.all([getPromotions(), getProducts()]);
        setPromotions(allPromotions);
        setProducts(allProducts);
    } catch (error) {
        console.error("Failed to load data:", error);
        toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormSubmit = async () => {
    setIsFormOpen(false);
    toast({
      title: selectedPromotion ? "Promoción actualizada" : "Promoción añadida",
      description: `La promoción se ha ${selectedPromotion ? 'actualizado' : 'guardado'} correctamente.`,
    });
    setSelectedPromotion(null);
    await loadData();
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
      await loadData();
    } else {
       toast({
        title: "Error",
        description: result.error || "No se pudo eliminar la promoción.",
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
  
  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Producto no encontrado';
  }

  const filteredPromotions = useMemo(() => {
    return promotions.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [promotions, searchTerm]);

  const FormSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full mt-4" />
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6 gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-2xl border">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold shrink-0">Promociones ({filteredPromotions.length})</h2>
         <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Buscar por título..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
         <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Añadir Promoción</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedPromotion ? 'Editar Promoción' : 'Añadir Nueva Promoción'}</DialogTitle>
              <DialogDescription>
                {selectedPromotion ? 'Modifica los detalles de la promoción.' : 'Rellena los detalles de la nueva promoción.'}
              </DialogDescription>
            </DialogHeader>
            <Suspense fallback={<FormSkeleton />}>
                <PromotionForm 
                  onPromotionSubmit={handleFormSubmit}
                  promotion={selectedPromotion}
                  products={products}
                />
            </Suspense>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Producto Asociado</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromotions.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell>
                  <Image
                    src={promotion.image}
                    alt={promotion.title}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                    loading="lazy"
                  />
                </TableCell>
                <TableCell className="font-medium">{promotion.title}</TableCell>
                <TableCell>
                  {promotion.productId ? (
                    <Badge variant="secondary">
                        <LinkIcon className='mr-2 h-3 w-3'/>
                        {getProductName(promotion.productId)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">Ninguno</span>
                  )}
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
          {filteredPromotions.length === 0 && (
            <div className="text-center p-10">
                <p className="text-muted-foreground">No se encontraron promociones con ese nombre.</p>
            </div>
            )}
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
