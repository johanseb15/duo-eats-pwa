
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { deleteAllOrders, importTestCategories, importTestDeliveryZones, importTestProducts } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, UploadCloud, Trash2 } from 'lucide-react';

export function SuperAdminActions() {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const { toast } = useToast();

    const handleAction = async (actionName: string, actionFn: () => Promise<{ success: boolean; message: string }>) => {
        const confirmationMessage = `¿Estás seguro de que quieres ${actionName.toLowerCase()}? Esta acción no se puede deshacer.`;
        
        if (actionName.includes("Borrar") && !window.confirm(confirmationMessage)) {
            return;
        }
        
        setLoadingAction(actionName);
        try {
            const result = await actionFn();
            if (result.success) {
                toast({
                    title: '¡Éxito!',
                    description: result.message,
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error(`Error durante la acción "${actionName}":`, error);
            toast({
                title: 'Error',
                description: error.message || `No se pudo completar la acción: ${actionName}.`,
                variant: 'destructive',
            });
        } finally {
            setLoadingAction(null);
        }
    };
    
    const actions = [
        { name: "Importar Productos de Prueba", icon: UploadCloud, fn: importTestProducts, variant: 'outline' as const },
        { name: "Importar Categorías de Prueba", icon: UploadCloud, fn: importTestCategories, variant: 'outline' as const },
        { name: "Importar Zonas de Entrega de Prueba", icon: UploadCloud, fn: importTestDeliveryZones, variant: 'outline' as const },
        { name: "Borrar TODOS los Pedidos", icon: Trash2, fn: deleteAllOrders, variant: 'destructive' as const },
    ];

    return (
        <Card className="border-destructive/50">
            <CardHeader>
                <div className='flex items-center gap-3'>
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
                        <CardDescription>
                            Las siguientes acciones son permanentes y no se pueden deshacer. Úsalas con precaución.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map(({ name, icon: Icon, fn, variant }) => (
                     <Button 
                        key={name}
                        variant={variant} 
                        onClick={() => handleAction(name, fn)} 
                        disabled={!!loadingAction}
                        className="w-full"
                    >
                        {loadingAction === name ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Icon className="mr-2 h-4 w-4" />
                        )}
                        {loadingAction === name ? 'Procesando...' : name}
                    </Button>
                ))}
            </CardContent>
        </Card>
    )
}
