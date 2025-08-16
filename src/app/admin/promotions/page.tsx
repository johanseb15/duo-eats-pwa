'use client';

import { lazy, useState, useEffect } from 'react';
import { AdminPage } from '@/components/AdminPage';
import type { Promotion, Product } from '@/lib/types';
import { addPromotion, deletePromotion, updatePromotion, fetchPromotions, fetchProducts } from '@/app/actions';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Link as LinkIcon } from 'lucide-react';

const PromotionForm = lazy(() => import('@/components/PromotionForm').then(module => ({ default: module.PromotionForm })));

const columns: { key: keyof Promotion; header: string }[] = [
  { key: 'image', header: 'Imagen' },
  { key: 'name', header: 'Nombre' },
  { key: 'productId', header: 'Producto Asociado' },
];

export default function AdminPromotionsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const allProducts = await fetchProducts();
      setProducts(allProducts);
    }
    loadProducts();
  }, []);

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Producto no encontrado';
  };

  const renderRow = (promotion: Promotion) => (
  <>
    <TableCell>
      <Image
        src={promotion.image}
        alt={promotion.name}
        width={50}
        height={50}
        className="rounded-md object-cover"
        loading="lazy"
      />
    </TableCell>
    <TableCell className="font-medium">{promotion.name}</TableCell>
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
  </>
);

  return (
    <AdminPage<Promotion>
      pageTitle="Promociones"
      addItemButtonText="Añadir Promoción"
      fetchData={fetchPromotions}
      columns={columns}
      renderRow={renderRow}
      Form={PromotionForm}
      onFormSubmit={(values, selectedItem) => {
        return selectedItem
          ? updatePromotion(selectedItem.id, values)
          : addPromotion(values);
      }}
      onDeleteConfirm={(selectedItem) => deletePromotion(selectedItem.id)}
      formProps={{ products }}
    />
  );
}