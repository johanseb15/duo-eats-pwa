
'use client';

import { useEffect, useState } from 'react';
import type { ProductCategoryData } from '@/lib/types';
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
import { deleteCategory } from '@/app/actions';
import { CategoryForm } from '@/components/CategoryForm';
import * as LucideIcons from 'lucide-react';


async function getCategories(): Promise<ProductCategoryData[]> {
  const categoriesCol = collection(db, 'categories');
  const q = query(categoriesCol, orderBy('name'));
  const categoriesSnapshot = await getDocs(q);
  const categoryList = categoriesSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      slug: data.slug,
      icon: data.icon,
    } as ProductCategoryData;
  });
  return categoryList;
}

const getIcon = (name: string): React.ElementType => {
    return (LucideIcons as any)[name] || LucideIcons.Package;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategoryData | null>(null);
  const { toast } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    const allCategories = await getCategories();
    setCategories(allCategories);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    toast({
      title: selectedCategory ? "Categoría actualizada" : "Categoría añadida",
      description: `La categoría se ha ${selectedCategory ? 'actualizado' : 'guardado'} correctamente.`,
    });
    setSelectedCategory(null);
    loadCategories();
  }
  
  const handleEditClick = (category: ProductCategoryData) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (category: ProductCategoryData) => {
    setSelectedCategory(category);
    setIsAlertOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    const result = await deleteCategory(selectedCategory.id);
    if (result.success) {
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada.",
      });
      loadCategories();
    } else {
       toast({
        title: "Error",
        description: "No se pudo eliminar la categoría.",
        variant: "destructive",
      });
    }
    setIsAlertOpen(false);
    setSelectedCategory(null);
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedCategory(null);
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
        <h2 className="text-2xl font-bold">Categorías</h2>
         <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Añadir Categoría</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedCategory ? 'Editar Categoría' : 'Añadir Nueva Categoría'}</DialogTitle>
              <DialogDescription>
                {selectedCategory ? 'Modifica los detalles de la categoría.' : 'Crea una nueva categoría para tus productos.'}
              </DialogDescription>
            </DialogHeader>
            <CategoryForm 
              onCategorySubmit={handleFormSubmit}
              category={selectedCategory}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ícono</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
                const Icon = getIcon(category.icon);
                return (
                  <TableRow key={category.id}>
                    <TableCell><Icon className="h-5 w-5" /></TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted p-2 rounded-lg">{category.slug}</code>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </div>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la categoría "{selectedCategory?.name}". Los productos de esta categoría no serán eliminados.
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
