
'use client';

import { useState, useRef, useTransition } from 'react';
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
    const [isUploading, startUploading] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        startUploading(async () => {
            await onFileUpload(file);
            setFile(null);
            // Clear the file input
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        });
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
                <Button onClick={handleUpload} disabled={!file || isUploading}>
                    {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
                </Button>
            </div>
        </div>
    );
}

export function SuperAdminActions() {
    const { toast } = useToast();
    const [isDeleting, startDeleting] = useTransition();

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
        startDeleting(async () => {
            await handleAction(deleteAllOrders);
        });
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Importación de Datos</CardTitle>
                    <CardDescription>
                        Importa productos, categorías o zonas de entrega desde un archivo JSON.
                    </CardDescription>
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
                </CardContent>
            </Card>

            <Card className="border-destructive/50">
                 <CardHeader>
                    <div className='flex items-center gap-3'>
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        <div>
                            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
                            <CardDescription>
                                La siguiente acción es permanente y no se puede deshacer. Úsala con precaución.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <Button 
                        variant='destructive'
                        onClick={handleDeleteAllOrders}
                        className="w-full"
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="animate-spin mr-2"/> : <Trash2 className="mr-2 h-4 w-4" />}
                        {isDeleting ? 'Borrando...' : 'Borrar TODOS los Pedidos'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
