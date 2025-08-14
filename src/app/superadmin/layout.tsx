
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Loader2 } from 'lucide-react';


export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isSuperAdmin, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return;

    if (!user || !isSuperAdmin) {
      router.push('/');
    }
  }, [user, isSuperAdmin, loading, router]);
  
  if (loading || !isSuperAdmin) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verificando acceso de Super Administrador...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
