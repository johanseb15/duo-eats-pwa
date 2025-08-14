
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';
import { ClipboardList, Package, Loader2, Megaphone, LayoutGrid, Truck, LineChart, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LineChart },
  { href: '/admin/orders', label: 'Pedidos', icon: ClipboardList },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/promotions', label: 'Promociones', icon: Megaphone },
  { href: '/admin/categories', label: 'Categorías', icon: LayoutGrid },
  { href: '/admin/delivery-zones', label: 'Zonas de Entrega', icon: Truck },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user || !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);
  
  if (loading || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
        <div className="border-b mb-6">
            <nav className="flex space-x-4 overflow-x-auto pb-2">
                {adminNavItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'pb-2 px-1 border-b-2 font-medium shrink-0',
                            pathname === item.href
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <item.icon className="inline-block w-5 h-5 mr-1" />
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
