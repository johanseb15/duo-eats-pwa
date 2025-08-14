
'use client';

import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';


export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
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
