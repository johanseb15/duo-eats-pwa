'use client';

import { lazy } from 'react';
import { AdminPage } from '@/components/AdminPage';
import type { DeliveryPerson } from '@/lib/types';
import { addDeliveryPerson, deleteDeliveryPerson, updateDeliveryPerson, fetchDeliveryPersons } from '@/app/actions';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const DeliveryPersonForm = lazy(() => import('@/components/DeliveryPersonForm').then(module => ({ default: module.DeliveryPersonForm })));

const columns: { key: keyof DeliveryPerson; header: string }[] = [
  { key: 'name', header: 'Nombre' },
  { key: 'phone', header: 'Teléfono' },
  { key: 'status', header: 'Estado' },
];

const renderRow = (person: DeliveryPerson) => (
  <>
    <TableCell className="font-medium">{person.name}</TableCell>
    <TableCell>{person.phone}</TableCell>
    <TableCell>
      <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
        {person.status === 'active' ? 'Activo' : 'Inactivo'}
      </Badge>
    </TableCell>
  </>
);

export default function AdminDeliveryPersonsPage() {
  return (
    <AdminPage<DeliveryPerson>
      pageTitle="Repartidores"
      addItemButtonText="Añadir Repartidor"
      fetchData={fetchDeliveryPersons}
      columns={columns}
      renderRow={renderRow}
      Form={DeliveryPersonForm}
      onFormSubmit={(values, selectedItem) => {
        return selectedItem
          ? updateDeliveryPerson(selectedItem.id, values)
          : addDeliveryPerson(values);
      }}
      onDeleteConfirm={(selectedItem) => deleteDeliveryPerson(selectedItem.id)}
    />
  );
}