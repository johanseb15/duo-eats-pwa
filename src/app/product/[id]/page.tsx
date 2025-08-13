
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is a fallback.
// If a user somehow navigates to /product/some-id,
// we redirect them to the homepage to prevent errors.
// The main product interaction now happens in the ProductSheet component.
export default function ProductRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null; // Render nothing while redirecting
}
