'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, User, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useEffect, useState } from 'react';

export function BottomNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const itemCount = isClient ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '#', icon: ClipboardList, label: 'Orders' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
    { href: '#', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t md:hidden z-50">
      <div className="flex h-full justify-around items-center max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = (href === '/' && pathname === href) || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center text-muted-foreground w-full h-full transition-colors hover:text-primary',
                isActive ? 'text-primary' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <Icon className="h-7 w-7" />
                {badge && badge > 0 ? (
                  <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {badge}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
