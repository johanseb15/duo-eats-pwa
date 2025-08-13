
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is a fallback to prevent errors from old URLs.
// It redirects all traffic to the homepage.
export default function ProductRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null; // Render nothing while redirecting
}
