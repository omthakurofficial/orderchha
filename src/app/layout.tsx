
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/context/app-context';
import { NotificationProvider } from '@/context/notification-context';
import { AuthLayout } from '@/components/layout/auth-layout';
import { ErrorBoundary } from '@/components/layout/error-boundary';

export const metadata: Metadata = {
  title: 'Sips & Slices Corner',
  description: 'Your favourite cafe corner.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Prevent zoom and ensure mobile footer stability
            (function() {
              // Disable pinch-to-zoom
              document.addEventListener('gesturestart', function(e) {
                e.preventDefault();
              });
              
              document.addEventListener('gesturechange', function(e) {
                e.preventDefault();
              });
              
              document.addEventListener('gestureend', function(e) {
                e.preventDefault();
              });
              
              // Force footer visibility on any viewport change
              function ensureFooterVisible() {
                const footer = document.querySelector('[data-mobile-footer]');
                if (footer && window.innerWidth <= 768) {
                  footer.style.position = 'fixed';
                  footer.style.bottom = '0';
                  footer.style.left = '0';
                  footer.style.right = '0';
                  footer.style.zIndex = '99999';
                  footer.style.opacity = '1';
                  footer.style.visibility = 'visible';
                  footer.style.display = 'flex';
                }
              }
              
              // Run on load and viewport changes
              window.addEventListener('load', ensureFooterVisible);
              window.addEventListener('resize', ensureFooterVisible);
              window.addEventListener('orientationchange', ensureFooterVisible);
              
              // Run periodically to catch any issues
              setInterval(ensureFooterVisible, 1000);
            })();
          `
        }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <AppProvider>
            <NotificationProvider>
              <AuthLayout>
                  {children}
              </AuthLayout>
              <Toaster />
            </NotificationProvider>
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
