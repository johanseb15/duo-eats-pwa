
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { items } = useCart();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemCount = isClient ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b backdrop-blur-xl hidden md:block transition-all duration-300",
      isScrolled ? "bg-background/95 shadow-lg" : "bg-background/60"
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt="Duo Eats Logo" width={28} height={28} className="h-7 w-7 text-primary transition-transform hover:scale-110" />
          <span className="text-2xl font-bold text-foreground">Duo Eats</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-full h-10 w-10 hover:bg-muted transition-all duration-200 hover:scale-110"
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <ShoppingCart className="h-6 w-6 text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground animate-pulse">
                {itemCount}
              </span>
            )}
          </Link>
           <Link
            href={user ? "/profile" : "/auth/signin"}
            className="relative flex items-center justify-center rounded-full h-10 w-10 hover:bg-muted transition-all duration-200 hover:scale-110"
            aria-label="Profile"
          >
            <User className="h-6 w-6 text-foreground" />
          </Link>
        </div>
      </div>
    </header>
  );
}
