'use client';

import { lazy } from 'react';
import { AdminPage } from '@/components/AdminPage';
import type { DeliveryZone } from '@/lib/types';
import { addDeliveryZone, deleteDeliveryZone, updateDeliveryZone, fetchDeliveryZones } from '@/app/actions';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const DeliveryZoneForm = lazy(() => import('@/components/DeliveryZoneForm').then(module => ({ default: module.DeliveryZoneForm })));

const currencySymbol = '$';

const columns: { key: keyof DeliveryZone; header: string }[] = [
  { key: 'name', header: 'Nombre' },
  { key: 'neighborhoods', header: 'Barrios' },
  { key: 'cost', header: 'Costo de envío' },
];

const renderRow = (zone: DeliveryZone) => (
  <>
    <TableCell className="font-medium">{zone.name}</TableCell>
    <TableCell>
      <div className='flex flex-wrap gap-2 max-w-md'>
        {zone.neighborhoods.map(n => <Badge key={n} variant="secondary">{n}</Badge>)}
      </div>
    </TableCell>
    <TableCell>{currencySymbol}{zone.cost.toFixed(2)}</TableCell>
  </>
);

export default function AdminDeliveryZonesPage() {
  return (
    <AdminPage<DeliveryZone>
      pageTitle="Zonas de Entrega"
      addItemButtonText="Añadir Zona"
      fetchData={fetchDeliveryZones}
      columns={columns}
      renderRow={renderRow}
      Form={DeliveryZoneForm}
      onFormSubmit={(values, selectedItem) => {
        return selectedItem
          ? updateDeliveryZone(selectedItem.id, values)
          : addDeliveryZone(values);
      }}
      onDeleteConfirm={(selectedItem) => deleteDeliveryZone(selectedItem.id)}
    />
  );
}