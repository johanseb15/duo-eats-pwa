
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Shield,
  UserCog,
  Moon,
  User,
  MapPin,
  CreditCard,
  Building,
  Home,
  Briefcase,
} from 'lucide-react';
import { signOut } from 'firebase/auth';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const menuItems = [
    // { icon: ClipboardList, text: 'Historial de pedidos', href: '/orders' },
    // { icon: MapPin, text: 'Direcciones', href: '#' },
    // { icon: CreditCard, text: 'Metodos de pago', href: '#' },
    // { icon: User, text: 'Mi perfil', href: '#' },
  ];

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-28">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="flex flex-col items-center text-center">
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="mt-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
          <div className="mt-8">
            <Skeleton className="h-14 w-full rounded-full" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage
              src={user.photoURL || undefined}
              alt={user.displayName || 'User'}
            />
            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">{user.displayName}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
            <TabsTrigger value="addresses">Direcciones</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center p-4 bg-card/60 backdrop-blur-xl rounded-xl shadow-sm">
                  <User className="w-6 h-6 mr-4 text-primary" />
                  <div className='flex-grow'>
                    <p className='font-semibold'>Nombre</p>
                    <p className='text-muted-foreground'>{user.displayName}</p>
                  </div>
                </div>
                 <div className="flex items-center p-4 bg-card/60 backdrop-blur-xl rounded-xl shadow-sm">
                  <Moon className="w-6 h-6 mr-4 text-primary" />
                  <span className="flex-grow font-semibold">Modo Oscuro</span>
                  <ThemeToggle />
                </div>
                {isAdmin && (
                  <Link href="/admin">
                    <div className="flex items-center p-4 bg-blue-500/20 backdrop-blur-xl rounded-xl shadow-sm hover:bg-blue-500/40 transition-all duration-200 hover:scale-105">
                      <Shield className="w-6 h-6 mr-4 text-blue-400" />
                      <span className="flex-grow font-semibold text-blue-300">
                        Panel de Administración
                      </span>
                    </div>
                  </Link>
                )}
                {isSuperAdmin && (
                  <Link href="/superadmin">
                    <div className="flex items-center p-4 bg-purple-500/20 backdrop-blur-xl rounded-xl shadow-sm hover:bg-purple-500/40 transition-all duration-200 hover:scale-105">
                      <UserCog className="w-6 h-6 mr-4 text-purple-400" />
                      <span className="flex-grow font-semibold text-purple-300">
                        Super Admin
                      </span>
                    </div>
                  </Link>
                )}
                 <Button
                  variant="destructive"
                  className="w-full rounded-full py-6 text-lg"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Cerrar sesión
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="addresses" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Mis Direcciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className='text-center py-10 text-muted-foreground'>
                    <MapPin className='mx-auto h-12 w-12 mb-4'/>
                    <p>Próximamente podrás guardar y gestionar tus direcciones aquí.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payments" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Mis Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className='text-center py-10 text-muted-foreground'>
                    <CreditCard className='mx-auto h-12 w-12 mb-4'/>
                    <p>Próximamente podrás guardar y gestionar tus métodos de pago aquí.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}
