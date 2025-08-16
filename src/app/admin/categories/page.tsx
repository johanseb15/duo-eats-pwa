
'use client';

import { lazy } from 'react';
import { AdminPage } from '@/components/AdminPage';
import type { ProductCategoryData } from '@/lib/types';
import { fetchCategories, addCategory, deleteCategory, updateCategory } from '@/app/actions';
import { TableCell } from '@/components/ui/table';
import * as LucideIcons from 'lucide-react';

const CategoryForm = lazy(() => import('@/components/CategoryForm').then(module => ({ default: module.CategoryForm })));

const getIcon = (name: string): React.ElementType => {
  const Icon = (LucideIcons as any)[name];
  return Icon || LucideIcons.Package;
};

const columns: { key: keyof ProductCategoryData; header: string }[] = [
  { key: 'icon', header: 'Ícono' },
  { key: 'name', header: 'Nombre' },
  { key: 'slug', header: 'Slug' },
];

const renderRow = (category: ProductCategoryData) => {
  const Icon = getIcon(category.icon);
  return (
    <>
      <TableCell><Icon className="h-5 w-5" /></TableCell>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell>
        <code className="text-sm bg-muted p-2 rounded-lg">{category.slug}</code>
      </TableCell>
    </>
  );
};

export default function AdminCategoriesPage() {
  return (
    <AdminPage<ProductCategoryData>
      pageTitle="Categorías"
      addItemButtonText="Añadir Categoría"
      fetchData={fetchCategories}
      columns={columns}
      renderRow={renderRow}
      Form={CategoryForm}
      onFormSubmit={(values, selectedItem) => {
        return selectedItem
          ? updateCategory(selectedItem.id, values)
          : addCategory(values);
      }}
      onDeleteConfirm={(selectedItem) => deleteCategory(selectedItem.id)}
    />
  );
}
