
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/context/app-context';

export const metadata: Metadata = {
  title: 'Sips & Slices Corner',
  description: 'Your favourite cafe corner.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isReceiptPage = (children as any)?.props?.childProp?.segment === 'receipt';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
            {isReceiptPage ? (
                <main>{children}</main>
            ) : (
                <AppShell>{children}</AppShell>
            )}
            <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
