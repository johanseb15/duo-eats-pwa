'use client';

import { lazy, useState, useEffect } from 'react';
import { AdminPage } from '@/components/AdminPage';
import type { Product, ProductCategoryData } from '@/lib/types';
import { addProduct, deleteProduct, updateProduct, fetchProducts, fetchCategories } from '@/app/actions';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const ProductForm = lazy(() => import('@/components/ProductForm').then(module => ({ default: module.ProductForm })));

const currencySymbol = '$';
const currentCurrency = 'ARS';

const columns: { key: keyof Product; header: string }[] = [
  { key: 'image', header: 'Imagen' },
  { key: 'name', header: 'Nombre' },
  { key: 'category', header: 'Categoría' },
  { key: 'price', header: 'Precio Base' },
  { key: 'stock', header: 'Stock' },
];

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<ProductCategoryData[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const allCategories = await fetchCategories();
      setCategories(allCategories);
    }
    loadCategories();
  }, []);

  const getCategoryName = (slug: string) => {
    return categories.find(c => c.slug === slug)?.name || slug;
  };

  const renderRow = (product: Product) => (
    <>
      <TableCell>
        <Image
          src={product.image}
          alt={product.name}
          width={50}
          height={50}
          className="rounded-md object-cover"
          loading="lazy"
        />
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>
        <Badge variant="secondary">{getCategoryName(product.category)}</Badge>
      </TableCell>
      <TableCell>{product.price[currentCurrency] ? `${currencySymbol}${product.price[currentCurrency].toFixed(2)}` : 'N/A'}</TableCell>
      <TableCell>
        {typeof product.stock === 'number' && product.stock > 0 ? product.stock : <Badge variant="destructive">Sin Stock</Badge>}
      </TableCell>
    </>
  );

  return (
    <AdminPage<Product>
      pageTitle="Productos"
      addItemButtonText="Añadir Producto"
      fetchData={fetchProducts}
      columns={columns}
      renderRow={renderRow}
      Form={ProductForm}
      onFormSubmit={(values, selectedItem) => {
        return selectedItem
          ? updateProduct(selectedItem.id, values)
          : addProduct(values);
      }}
      onDeleteConfirm={(selectedItem) => deleteProduct(selectedItem.id)}
      formProps={{ categories }}
    />
  );
}