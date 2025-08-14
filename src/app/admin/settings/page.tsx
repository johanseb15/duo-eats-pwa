
'use client';

import { useEffect, useState, Suspense } from 'react';
import type { RestaurantSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { fetchRestaurantSettings } from '@/app/actions';
import { SettingsForm } from '@/components/SettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FormSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full mt-4" />
    </div>
);

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSettings = async () => {
    setLoading(true);
    try {
        const currentSettings = await fetchRestaurantSettings();
        setSettings(currentSettings);
    } catch (error) {
        console.error("Failed to load settings:", error);
        toast({ title: "Error", description: "No se pudieron cargar los ajustes.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleFormSubmit = async () => {
    toast({
      title: "Ajustes Guardados",
      description: "La configuración del restaurante se ha actualizado correctamente.",
    });
    await loadSettings();
  };

  if (loading) {
    return (
       <Card>
        <CardHeader>
            <CardTitle>Configuración del Restaurante</CardTitle>
            <CardDescription>Gestiona los horarios, días de apertura y número de contacto.</CardDescription>
        </CardHeader>
        <CardContent>
            <FormSkeleton />
        </CardContent>
       </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Configuración del Restaurante</CardTitle>
            <CardDescription>Gestiona los horarios, días de apertura y número de contacto.</CardDescription>
        </CardHeader>
        <CardContent>
            <Suspense fallback={<FormSkeleton />}>
                <SettingsForm
                    onFormSubmit={handleFormSubmit}
                    settings={settings}
                />
            </Suspense>
        </CardContent>
    </Card>
  );
}
