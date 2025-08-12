
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getCartItemId = (item: any) => {
  const optionsIdentifier = item.selectedOptions
    ? Object.entries(item.selectedOptions).sort().join('-')
    : '';
  return `${item.id}-${optionsIdentifier}`;
};

const deliveryZones = [
  { name: 'Zona 1', cost: 5.00 },
  { name: 'Zona 2', cost: 7.50 },
  { name: 'Zona 3', cost: 10.00 },
  { name: 'Retiro en local', cost: 0.00 },
]


export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [deliveryCost, setDeliveryCost] = useState(0);

  const subtotal = items.reduce(
    (acc, item) => acc + item.finalPrice * item.quantity,
    0
  );
  
  const total = subtotal + deliveryCost;

  const handleZoneChange = (zoneName: string) => {
    const zone = deliveryZones.find(z => z.name === zoneName);
    setDeliveryCost(zone ? zone.cost : 0);
  }

  const sendWhatsApp = () => {
    const phone = '1234567890'; // Replace with the restaurant's number
    const message = encodeURIComponent(
      `¡Hola! Quisiera hacer el siguiente pedido:\n\n${items
        .map((i) => {
          const optionsString = i.selectedOptions ? ` (${Object.values(i.selectedOptions).join(', ')})` : '';
          return `* ${i.name}${optionsString} x ${i.quantity} (S/. ${(i.finalPrice * i.quantity).toFixed(2)})`
        })
        .join('\n')}\n\n*Subtotal: S/. ${subtotal.toFixed(2)}*\n*Envío: S/. ${deliveryCost.toFixed(2)}*\n*Total: S/. ${total.toFixed(2)}*`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

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
          <div className="space-y-4">
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
                      {item.selectedOptions && (
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
                       <p className="text-lg font-bold">S/. {(item.finalPrice * item.quantity).toFixed(2)}</p>
                       <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => removeFromCart(cartItemId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                )
              })}

              <Card className="shadow-xl rounded-2xl bg-card/60 backdrop-blur-xl border-white/20 p-4">
                <CardHeader className="p-2">
                  <CardTitle>Zona de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                   <Select onValueChange={handleZoneChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tu zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryZones.map(zone => (
                         <SelectItem key={zone.name} value={zone.name}>{zone.name} (+ S/. {zone.cost.toFixed(2)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="shadow-xl rounded-2xl bg-card/60 backdrop-blur-xl border-white/20">
                <CardContent className="p-4 space-y-2">
                   <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>S/. {subtotal.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span>S/. {deliveryCost.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between font-bold text-2xl">
                    <span>Total</span>
                    <span>S/. {total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="fixed bottom-24 left-0 right-0 p-4">
                 <Button onClick={sendWhatsApp} size="lg" className="w-full rounded-full text-lg py-7 bg-green-500 hover:bg-green-600 text-white">
                    Enviar por WhatsApp
                  </Button>
              </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
