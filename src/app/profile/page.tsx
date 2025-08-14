
'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
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
  Home,
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { UserAddress } from '@/lib/types';
import { fetchAddressesByUserId, deleteAddress } from '../actions';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AddressForm = lazy(() => import('@/components/AddressForm').then(module => ({ default: module.AddressForm })));

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const { toast } = useToast();

  // State for dialogs
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

  const loadAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const userAddresses = await fetchAddressesByUserId(user.uid);
      setAddresses(userAddresses);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus direcciones.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };
  
  const handleEditAddress = (address: UserAddress) => {
    setSelectedAddress(address);
    setIsAddressFormOpen(true);
  };
  
  const handleDeleteAddress = (address: UserAddress) => {
    setSelectedAddress(address);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (!selectedAddress) return;
    const result = await deleteAddress(selectedAddress.id);
    if (result.success) {
      toast({ title: 'Dirección eliminada' });
      loadAddresses();
    } else {
      toast({ title: 'Error al eliminar la dirección', variant: 'destructive' });
    }
    setIsDeleteAlertOpen(false);
    setSelectedAddress(null);
  };

  const handleFormSuccess = () => {
    setIsAddressFormOpen(false);
    setSelectedAddress(null);
    toast({ title: selectedAddress ? 'Dirección actualizada' : 'Dirección añadida' });
    loadAddresses();
  };


  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-28">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="mt-8 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const getAddressIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('casa')) return <Home className="w-5 h-5 text-primary" />;
    if (lowerName.includes('trabajo')) return <Briefcase className="w-5 h-5 text-primary" />;
    return <MapPin className="w-5 h-5 text-primary" />;
  }

  return (
    <>
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
                  <div className="flex justify-between items-center">
                    <CardTitle>Mis Direcciones</CardTitle>
                     <Dialog open={isAddressFormOpen} onOpenChange={(open) => { setIsAddressFormOpen(open); if (!open) setSelectedAddress(null); }}>
                      <DialogTrigger asChild>
                         <Button size="sm"><PlusCircle className='mr-2' />Añadir</Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>{selectedAddress ? 'Editar Dirección' : 'Añadir Nueva Dirección'}</DialogTitle>
                          </DialogHeader>
                          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                            <AddressForm
                                userId={user.uid}
                                address={selectedAddress}
                                onSubmitSuccess={handleFormSuccess}
                            />
                          </Suspense>
                      </DialogContent>
                     </Dialog>
                  </div>
                  <CardDescription>Gestiona tus direcciones de envío guardadas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingAddresses ? (
                     <div className='text-center py-10'><Loader2 className='mx-auto h-12 w-12 animate-spin text-primary'/></div>
                  ) : addresses.length > 0 ? (
                    addresses.map(address => (
                      <div key={address.id} className="flex items-center p-4 bg-card/60 backdrop-blur-xl rounded-xl shadow-sm">
                        {getAddressIcon(address.name)}
                        <div className="ml-4 flex-grow">
                          <p className="font-semibold">{address.name}</p>
                          <p className="text-sm text-muted-foreground">{address.fullAddress}</p>
                          {address.details && <p className="text-xs text-muted-foreground italic">{address.details}</p>}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical/></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleEditAddress(address)}><Edit className='mr-2'/> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteAddress(address)} className='text-destructive focus:text-destructive'><Trash2 className='mr-2'/> Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-10 text-muted-foreground'>
                      <MapPin className='mx-auto h-12 w-12 mb-4'/>
                      <p>No tienes direcciones guardadas. ¡Añade una para un checkout más rápido!</p>
                    </div>
                  )}
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

       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la dirección "{selectedAddress?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAddress} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
