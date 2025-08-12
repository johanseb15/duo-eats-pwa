
'use client';

import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function Header() {
  const { items } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const itemCount = isClient ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Dúo Previa Logo" width={140} height={40} />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-full h-10 w-10 hover:bg-muted transition-colors"
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <ShoppingCart className="h-6 w-6 text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
           <Link
            href="/profile"
            className="relative flex items-center justify-center rounded-full h-10 w-10 hover:bg-muted transition-colors"
            aria-label="Profile"
          >
            <User className="h-6 w-6 text-foreground" />
          </Link>
        </div>
      </div>
    </header>
  );
}
