'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, MoreVertical, Edit, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface AdminPageProps<T extends { id: string }> {
  pageTitle: string;
  addItemButtonText: string;
  fetchData: () => Promise<T[]>;
  columns: { key: keyof T; header: string }[];
  renderRow: (item: T) => React.ReactNode;
  Form: React.ComponentType<{
    onSubmit: (values: any) => void;
    item?: T | null;
    isSubmitting: boolean;
    [key: string]: any;
  }>;
  onFormSubmit: (values: any, selectedItem?: T | null) => Promise<{ success: boolean; error?: string }>;
  onDeleteConfirm: (selectedItem: T) => Promise<{ success: boolean; error?: string }>;
  formProps?: Record<string, any>;
  searchPlaceholder?: string;
}

export function AdminPage<T extends { id: string; name?: string }>({
  pageTitle,
  addItemButtonText,
  fetchData,
  columns,
  renderRow,
  Form,
  onFormSubmit,
  onDeleteConfirm,
  formProps = {},
  searchPlaceholder = "Buscar...",
}: AdminPageProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } catch (error) {
      console.error(`Error loading ${pageTitle.toLowerCase()}:`, error);
      toast({
        title: 'Error de carga',
        description: `No se pudieron cargar los ${pageTitle.toLowerCase()}.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) => {
      const searchableText = item.name || JSON.stringify(item).toLowerCase();
      return searchableText.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  const handleAdd = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: T) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: T) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  };

  const handleFormSubmit = (values: any) => {
    startTransition(async () => {
      const result = await onFormSubmit(values, selectedItem);
      if (result.success) {
        toast({
          title: selectedItem ? 'Actualizado correctamente' : 'Creado correctamente',
          description: `${pageTitle.slice(0, -1)} ${selectedItem ? 'actualizado' : 'creado'} exitosamente.`,
        });
        setIsFormOpen(false);
        setSelectedItem(null);
        await loadData();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Ocurrió un error inesperado.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    
    startTransition(async () => {
      const result = await onDeleteConfirm(selectedItem);
      if (result.success) {
        toast({
          title: 'Eliminado correctamente',
          description: `${pageTitle.slice(0, -1)} eliminado exitosamente.`,
        });
        setIsDeleteAlertOpen(false);
        setSelectedItem(null);
        await loadData();
      } else {
        toast({
          title: 'Error al eliminar',
          description: result.error || 'No se pudo eliminar el elemento.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleRefresh = () => {
    startRefresh(async () => {
      await loadData();
      toast({
        title: 'Datos actualizados',
        description: `${pageTitle} actualizados correctamente.`,
      });
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold">{pageTitle}</h2>
        <Button onClick={handleAdd} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          {addItemButtonText}
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>{column.header}</TableHead>
              ))}
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  {renderRow(item)}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(item)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-10">
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No se encontraron resultados.' : `No hay ${pageTitle.toLowerCase()} disponibles.`}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `Editar ${pageTitle.slice(0, -1)}` : `Añadir ${pageTitle.slice(0, -1)}`}
            </DialogTitle>
          </DialogHeader>
          <Form
            onSubmit={handleFormSubmit}
            item={selectedItem}
            isSubmitting={isSubmitting}
            {...formProps}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este elemento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}