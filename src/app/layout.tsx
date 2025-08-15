import type { Metadata, Viewport } from 'next';
import { Open_Sans, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

const fontSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const fontHeading = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Dúo Eats',
  description: 'Sabores intensos.',
};

export const viewport: Viewport = {
  themeColor: '#f97316', // Vibrant Orange from new palette
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontHeading.variable
        )}
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
