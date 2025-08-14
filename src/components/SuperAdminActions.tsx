
'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
    importProductsFromFile,
    importCategoriesFromFile,
    importDeliveryZonesFromFile,
    deleteAllOrders
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, UploadCloud, Trash2 } from 'lucide-react';
import { Input } from './ui/input';

interface FileUploaderProps {
    title: string;
    onFileUpload: (file: File) => Promise<void>;
}

function FileUploaderAction({ title, onFileUpload }: FileUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        await onFileUpload(file);
        setLoading(false);
        setFile(null);
        // Clear the file input
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card/50">
            <h4 className="font-semibold text-sm">{title}</h4>
            <div className="flex gap-2">
                 <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="flex-grow file:mr-2 file:text-primary file:font-semibold file:border-0 file:bg-transparent"
                />
                <Button onClick={handleUpload} disabled={!file || loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
                </Button>
            </div>
        </div>
    );
}

export function SuperAdminActions() {
    const { toast } = useToast();

    const handleFileAction = async (actionFn: (data: any) => Promise<{ success: boolean; message: string }>, file: File) => {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            const result = await actionFn(data);
             if (result.success) {
                toast({
                    title: '¡Éxito!',
                    description: result.message,
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error(`Error durante la acción de carga:`, error);
            toast({
                title: 'Error de carga',
                description: error.message || `No se pudo procesar el archivo.`,
                variant: 'destructive',
            });
        }
    };
    
    const handleDeleteAllOrders = async () => {
         if (!window.confirm("¿Estás seguro de que quieres borrar TODOS los pedidos? Esta acción no se puede deshacer.")) {
            return;
        }
        await handleAction(deleteAllOrders);
    }
    
    const handleAction = async (actionFn: () => Promise<{ success: boolean; message: string }>) => {
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
        } catch(error: any) {
             console.error(`Error durante la acción:`, error);
            toast({
                title: 'Error',
                description: error.message || `No se pudo completar la acción.`,
                variant: 'destructive',
            });
        }
    }


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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FileUploaderAction
                    title="Importar Productos (.json)"
                    onFileUpload={(file) => handleFileAction(importProductsFromFile, file)}
                />
                 <FileUploaderAction
                    title="Importar Categorías (.json)"
                    onFileUpload={(file) => handleFileAction(importCategoriesFromFile, file)}
                />
                 <FileUploaderAction
                    title="Importar Zonas de Entrega (.json)"
                    onFileUpload={(file) => handleFileAction(importDeliveryZonesFromFile, file)}
                />
                <div className="p-4 border rounded-lg bg-card/50 flex flex-col justify-center">
                     <Button 
                        variant='destructive'
                        onClick={handleDeleteAllOrders}
                        className="w-full"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Borrar TODOS los Pedidos
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
