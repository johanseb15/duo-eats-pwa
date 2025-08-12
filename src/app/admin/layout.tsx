
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';
import { ClipboardList, Package } from 'lucide-react';

const adminNavItems = [
  { href: '/admin/orders', label: 'Pedidos', icon: ClipboardList },
  { href: '/admin/products', label: 'Productos', icon: Package },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
        <div className="border-b mb-6">
            <nav className="flex space-x-4">
                {adminNavItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'pb-2 px-1 border-b-2 font-medium',
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
