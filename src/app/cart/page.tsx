'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingCart, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const sendWhatsApp = () => {
    const phone = '1234567890'; // Replace with the restaurant's number
    const message = encodeURIComponent(
      `Hello, I'd like to place an order:\n\n${items
        .map((i) => `* ${i.name} x ${i.quantity} (S/. ${(i.price * i.quantity).toFixed(2)})`)
        .join('\n')}\n\n*Total: S/. ${total.toFixed(2)}*`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-headline text-4xl font-bold">Your Cart</h1>
          {items.length > 0 && (
            <Button variant="destructive" onClick={clearCart} size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
             <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/">Start Ordering</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="flex items-center p-4 shadow-md rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xl border-white/20">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                    data-ai-hint={item.aiHint}
                  />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-primary font-bold">S/. {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="shadow-xl rounded-2xl sticky top-24 bg-card/60 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>S/. {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes & Fees</span>
                    <span>S/. 0.00</span>
                  </div>
                   <div className="flex justify-between font-bold text-xl pt-4 border-t">
                    <span>Total</span>
                    <span>S/. {total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button onClick={sendWhatsApp} size="lg" className="w-full rounded-full text-lg py-6">
                    Send Order via WhatsApp 📲
                  </Button>
                  <Alert className="mt-2 text-sm bg-transparent border-primary/30">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle>Guest Checkout</AlertTitle>
                    <AlertDescription>
                      You'll confirm details and payment directly in WhatsApp.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
