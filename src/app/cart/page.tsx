
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Trash2, ShoppingCart, Loader2, CalendarIcon, Clock } from 'lucide-react';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Currency, CartItem } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';

const AddressAutocomplete = lazy(() => import('@/components/AddressAutocomplete'));

// TODO: Replace with a settings store
const currentCurrency: Currency = 'ARS';
const currencySymbol = '$';

const getCartItemId = (item: CartItem) => {
    const optionsIdentifier = item.selectedOptions && Object.keys(item.selectedOptions).length > 0
      ? Object.entries(item.selectedOptions).sort().map(([key, value]) => `${key}:${value}`).join('-')
      : '';
    return `${item.id}-${optionsIdentifier}`;
};


export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [deliveryCost, setDeliveryCost] = useState(0);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  
  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestNeighborhood, setGuestNeighborhood] = useState<string | null>(null);

  // Scheduled Order
  const [scheduleOption, setScheduleOption] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState<string>('');


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (deliveryOption === 'pickup') {
      setDeliveryCost(0);
      setSelectedZoneId('retiro');
      setGuestAddress('Retiro en local');
      setGuestNeighborhood('Retiro en local');
    } else {
       // Reset when switching back to delivery
       setDeliveryCost(0);
       setSelectedZoneId(null);
       setGuestAddress('');
       setGuestNeighborhood(null);
    }
  }, [deliveryOption])


  const { subtotal, finalSubtotal } = useMemo(() => {
    const rawSubtotal = items.reduce(
      (acc, item) => acc + item.finalPrice * item.quantity,
      0
    );

    return { subtotal: rawSubtotal, finalSubtotal: rawSubtotal };
  }, [items]);
  
  const total = finalSubtotal + deliveryCost;

  const handleAddressSelect = (address: string, neighborhood: string | null, cost: number, zoneId: string | null) => {
    setGuestAddress(address);
    setGuestNeighborhood(neighborhood);
    setDeliveryCost(cost);
    setSelectedZoneId(zoneId);
  };

  const handleCheckout = async () => {
     if (!selectedZoneId) {
        toast({
            title: 'Completa tu pedido',
            description: deliveryOption === 'delivery'
              ? 'Por favor, introduce una dirección válida para calcular el envío.'
              : 'Selecciona una opción para continuar.',
            variant: 'destructive',
        });
        return;
    }
    
    if (scheduleOption === 'later' && (!scheduledDate || !scheduledTime)) {
      toast({
        title: 'Completa la programación',
        description: 'Por favor, selecciona una fecha y hora para tu pedido programado.',
        variant: 'destructive',
      });
      return;
    }

    const userName = user?.displayName || guestName;
    if (!userName) {
        toast({
            title: 'Faltan datos',
            description: 'Por favor, completa tu nombre para continuar.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsProcessing(true);
    
    let finalDeliveryDate: string | undefined;
    if (scheduleOption === 'later' && scheduledDate && scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const deliveryDate = new Date(scheduledDate);
      deliveryDate.setHours(hours, minutes);
      finalDeliveryDate = deliveryDate.toISOString();
    }

    const orderInput = {
      userId: user?.uid,
      userName: userName,
      items: items,
      total: total,
      subtotal: finalSubtotal,
      deliveryCost: deliveryCost,
      deliveryDate: finalDeliveryDate,
      neighborhood: guestNeighborhood || undefined,
    };

    const result = await createOrder(orderInput);

    if (result.success && result.orderId) {
        sendWhatsApp(result.orderId, userName, guestAddress, finalDeliveryDate);
        toast({
          title: '¡Pedido guardado!',
          description: 'Tu pedido ha sido guardado y serás redirigido para el seguimiento.',
        });
        clearCart();
        router.push(`/order/${result.orderId}`);
    } else {
        toast({
          title: 'Error al crear el pedido',
          description: 'Hubo un problema al guardar tu pedido. Por favor, intenta de nuevo.',
          variant: 'destructive',
        });
    }

    setIsProcessing(false);
  };


  const sendWhatsApp = (orderId?: string, name?: string, address?: string, deliveryDate?: string) => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '549111234567';
    let message = `¡Hola! Quisiera hacer el siguiente pedido:\n`;
    if (orderId) {
      message += `\n*N° de Pedido: ${orderId.slice(0, 6)}*\n`;
    }
    if (name) {
      message += `*Cliente: ${name}*\n`;
    }
    
    if (deliveryOption === 'pickup') {
      message += `*Modalidad: Retiro en local*\n`;
    } else if (address) {
      message += `*Dirección de Entrega: ${address}*\n`;
    }

    if (deliveryDate) {
        message += `*Entrega Programada para: ${format(new Date(deliveryDate), "eeee d 'de' MMMM 'a las' HH:mm", { locale: es })}hs*\n`;
    }


    message += `\n${items
        .map((i) => {
          const optionsString = i.selectedOptions && Object.values(i.selectedOptions).length > 0 ? ` (${Object.values(i.selectedOptions).join(', ')})` : '';
          return `* ${i.name}${optionsString} x ${i.quantity} (${currencySymbol}${(i.finalPrice * i.quantity).toFixed(2)})`
        })
        .join('\n')}\n`
    
    message += `\n*Subtotal: ${currencySymbol}${finalSubtotal.toFixed(2)}*\n*Envío: ${currencySymbol}${deliveryCost.toFixed(2)}*\n*Total: ${currencySymbol}${total.toFixed(2)}*`
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const timeSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '20:00', '20:30', '21:00', '21:30', '22:00'];

  if (!isClient || authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-28">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Mi Carrito</h1>
          <Skeleton className="h-48 w-full" />
           <Skeleton className="h-48 w-full mt-4" />
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mi Carrito</h1>
          {items.length > 0 && (
            <Button variant="destructive" onClick={clearCart} size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Vaciar
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
             <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-semibold">Tu carrito está vacío</h2>
            <p className="mt-2 text-muted-foreground">
              Parece que aún no has añadido nada.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/">Comenzar a ordenar</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pb-32 md:pb-0">
              {items.map((item) => {
                const cartItemId = getCartItemId(item);
                return (
                  <Card key={cartItemId} className="flex items-center p-4 shadow-md rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xl border-white/20">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                      data-ai-hint={item.aiHint}
                    />
                    <div className="ml-4 flex-grow">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {item.selectedOptions && Object.values(item.selectedOptions).length > 0 && (
                        <p className="text-sm text-muted-foreground">{Object.values(item.selectedOptions).join(', ')}</p>
                      )}
                       <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="icon" className='h-8 w-8 rounded-full' onClick={() => updateQuantity(cartItemId, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <Button variant="outline" size="icon" className='h-8 w-8 rounded-full' onClick={() => updateQuantity(cartItemId, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                          </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <p className="text-lg font-bold">{currencySymbol} {(item.finalPrice * item.quantity).toFixed(2)}</p>
                       <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => removeFromCart(cartItemId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                )
              })}

              
              <Card className="shadow-xl rounded-2xl bg-card/60 backdrop-blur-xl border-white/20 p-4">
                  <CardHeader className="p-2">
                      <CardTitle>Tus Datos y Entrega</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-4">
                      {!user && (
                        <div>
                            <Label htmlFor="guestName">Nombre</Label>
                            <Input id="guestName" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Tu nombre completo" />
                        </div>
                      )}
                      
                      <Label>Opciones de Entrega</Label>
                       <Select onValueChange={(value: 'delivery' | 'pickup') => setDeliveryOption(value)} value={deliveryOption}>
                          <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una opción" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="delivery">Enviar a domicilio</SelectItem>
                              <SelectItem value="pickup">Retirar en el local</SelectItem>
                          </SelectContent>
                      </Select>

                      
                      <Suspense fallback={<Skeleton className='h-10 w-full' />}>
                        <AddressAutocomplete onAddressSelect={handleAddressSelect} disabled={deliveryOption === 'pickup'} />
                      </Suspense>
                      
                      
                       <Separator />

                      <Label>¿Cuándo quieres tu pedido?</Label>
                       <RadioGroup value={scheduleOption} onValueChange={(value: 'now' | 'later') => setScheduleOption(value)} className='grid grid-cols-2 gap-4'>
                          <Label htmlFor='now' className='flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer'>
                              <RadioGroupItem value="now" id="now" className='sr-only' />
                              <Clock className="mb-3 h-6 w-6" />
                              Lo antes posible
                          </Label>
                           <Label htmlFor='later' className='flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer'>
                              <RadioGroupItem value="later" id="later" className='sr-only' />
                              <CalendarIcon className="mb-3 h-6 w-6" />
                              Programar
                          </Label>
                      </RadioGroup>

                      {scheduleOption === 'later' && (
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !scheduledDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {scheduledDate ? format(scheduledDate, 'PPP', {locale: es}) : <span>Elige una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={scheduledDate}
                                    onSelect={setScheduledDate}
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                               <Select value={scheduledTime} onValueChange={setScheduledTime}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Elige una hora" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {timeSlots.map(time => (
                                          <SelectItem key={time} value={time}>{time}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                      )}
                  </CardContent>
              </Card>

              <Card className="shadow-xl rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                <CardContent className="p-4 space-y-2">
                   <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{currencySymbol} {subtotal.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span>{deliveryCost > 0 ? `${currencySymbol} ${deliveryCost.toFixed(2)}` : (selectedZoneId ? 'Gratis' : 'A calcular')}</span>
                  </div>
                   <div className="flex justify-between font-bold text-2xl">
                    <span>Total</span>
                    <span>{currencySymbol} {total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="md:mt-6 md:p-0 p-4 md:static md:bottom-auto md:left-auto md:right-auto fixed bottom-24 left-0 right-0">
                 <Button onClick={handleCheckout} size="lg" className="w-full rounded-full text-lg py-7 bg-green-500 hover:bg-green-600 text-white" disabled={isProcessing || !selectedZoneId}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : 'Finalizar y Enviar por WhatsApp'}
                  </Button>
              </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
