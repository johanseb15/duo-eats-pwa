
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  MapPin,
  User,
  LogOut,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();

  const menuItems = [
    { icon: ClipboardList, text: 'Historial de pedidos', href: '/orders' },
    { icon: MapPin, text: 'Direcciones', href: '#' },
    { icon: CreditCard, text: 'Metodos de pago', href: '#' },
    { icon: User, text: 'Mi perfil', href: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="relative flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold text-center flex-grow">Perfil</h1>
            <div className="w-10"></div> {/* Spacer */}
        </div>


        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src="https://placehold.co/100x100.png" alt="Johan González" data-ai-hint="profile picture" />
            <AvatarFallback>JG</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">Johan González</h2>
        </div>

        <div className="mt-8 space-y-3">
            {menuItems.map((item) => (
              <Link href={item.href} key={item.text}>
                  <div className="flex items-center p-4 bg-card/60 backdrop-blur-xl rounded-xl shadow-sm hover:bg-card/90 transition-all duration-200 hover:scale-105">
                      <item.icon className="w-6 h-6 mr-4 text-primary" />
                      <span className="flex-grow font-semibold">{item.text}</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
              </Link>
            ))}
        </div>

         <div className="mt-8">
            <Button variant="destructive" className="w-full rounded-full py-6 text-lg" onClick={() => console.log('Cerrar sesión')}>
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar sesión
            </Button>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
