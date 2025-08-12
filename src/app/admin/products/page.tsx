
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductForm } from '@/components/ProductForm';
import { useToast } from '@/hooks/use-toast';

async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productsSnapshot = await getDocs(productsCol);
  const productList = productsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      aiHint: data.aiHint,
      options: data.options,
    } as Product;
  });
  return productList;
}

const currencySymbol = 'S/.';
const currentCurrency = 'PEN';


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    const allProducts = await getProducts();
    setProducts(allProducts);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleProductAdded = () => {
    setIsDialogOpen(false);
    toast({
      title: "Producto añadido",
      description: "El nuevo producto se ha guardado correctamente.",
    });
    loadProducts(); // Refresh the list
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
        <h2 className="text-2xl font-bold">Productos</h2>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Producto</DialogTitle>
              <DialogDescription>
                Rellena los detalles del nuevo producto que se añadirá al menú.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onProductAdded={handleProductAdded} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card/60 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio Base</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
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
                <TableCell>{currencySymbol}{product.price[currentCurrency].toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
