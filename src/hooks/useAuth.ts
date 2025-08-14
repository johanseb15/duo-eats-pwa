
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
        // Role check logic is now centralized here
        const adminUids = process.env.NEXT_PUBLIC_ADMIN_UIDS?.split(',') || [];
        const superAdminUids = process.env.NEXT_PUBLIC_SUPERADMIN_UIDS?.split(',') || [];
        
        setIsAdmin(adminUids.includes(user.uid));
        setIsSuperAdmin(superAdminUids.includes(user.uid));
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAdmin, isSuperAdmin };
}
