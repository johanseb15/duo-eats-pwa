
'use client';

import { useEffect, useState, Suspense, lazy, useMemo } from 'react';
import Image from 'next/image';
import type { Product, ProductCategoryData } from '@/lib/types';
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Search } from 'lucide-react';
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
import { deleteProduct } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const ProductForm = lazy(() => import('@/components/ProductForm').then(module => ({ default: module.ProductForm })));


async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const q = query(productsCol, orderBy('name'));
  const productsSnapshot = await getDocs(q);
  const productList = productsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      aiHint: data.aiHint,
      category: data.category,
      stock: data.stock,
      options: data.options || [],
    } as Product;
  });
  return productList;
}

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

const currencySymbol = '$';
const currentCurrency = 'ARS';


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
        const [allProducts, allCategories] = await Promise.all([getProducts(), getCategories()]);
        setProducts(allProducts);
        setCategories(allCategories);
    } catch (error) {
        console.error("Failed to load products or categories:", error);
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
      title: selectedProduct ? "Producto actualizado" : "Producto añadido",
      description: `El producto se ha ${selectedProduct ? 'actualizado' : 'guardado'} correctamente.`,
    });
    setSelectedProduct(null);
    await loadData();
  }
  
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsAlertOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    const result = await deleteProduct(selectedProduct.id);
    if (result.success) {
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del catálogo.",
      });
      await loadData();
    } else {
       toast({
        title: "Error",
        description: result.error || "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    }
    setIsAlertOpen(false);
    setSelectedProduct(null);
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedProduct(null);
    }
    setIsFormOpen(open);
  }
  
  const getCategoryName = (slug: string) => {
    return categories.find(c => c.slug === slug)?.name || slug;
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);


  const FormSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
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
            <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold shrink-0">Productos ({filteredProducts.length})</h2>
         <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nombre..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
         <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
              <DialogDescription>
                {selectedProduct ? 'Modifica los detalles del producto.' : 'Rellena los detalles del nuevo producto que se añadirá al menú.'}
              </DialogDescription>
            </DialogHeader>
            <Suspense fallback={<FormSkeleton />}>
                <ProductForm 
                  onProductSubmit={handleFormSubmit}
                  product={selectedProduct}
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
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio Base</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{getCategoryName(product.category)}</Badge>
                </TableCell>
                <TableCell>{product.price[currentCurrency] ? `${currencySymbol}${product.price[currentCurrency].toFixed(2)}` : 'N/A'}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-right">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-destructive focus:text-destructive">
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
         {filteredProducts.length === 0 && (
          <div className="text-center p-10">
            <p className="text-muted-foreground">No se encontraron productos con ese nombre.</p>
          </div>
        )}
      </div>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el producto "{selectedProduct?.name}" de tu catálogo.
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
