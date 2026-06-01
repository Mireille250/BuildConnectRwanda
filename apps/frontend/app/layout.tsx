import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BuildConnect Rwanda',
  description: 'Connecting Rwanda\'s construction industry',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}