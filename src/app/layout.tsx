
import type { Metadata } from 'next';
import './globals.css';
import '../styles/modern-layout.css';
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
            // Ensure footer visibility on all devices and zoom levels
            (function() {
              // Disable pinch-to-zoom on mobile
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
              function ensureFootersVisible() {
                // Mobile footer
                const mobileFooter = document.querySelector('[data-mobile-footer]');
                if (mobileFooter && window.innerWidth <= 768) {
                  mobileFooter.style.position = 'fixed';
                  mobileFooter.style.bottom = '0';
                  mobileFooter.style.left = '0';
                  mobileFooter.style.right = '0';
                  mobileFooter.style.zIndex = '99999';
                  mobileFooter.style.opacity = '1';
                  mobileFooter.style.visibility = 'visible';
                  mobileFooter.style.display = 'flex';
                }
                
                // Desktop footer - ensure it's visible at all zoom levels
                const desktopFooter = document.querySelector('.desktop-footer');
                if (desktopFooter && window.innerWidth > 768) {
                  desktopFooter.style.position = 'fixed';
                  desktopFooter.style.bottom = '0';
                  desktopFooter.style.left = '0';
                  desktopFooter.style.right = '0';
                  desktopFooter.style.zIndex = '40';
                  desktopFooter.style.display = 'block';
                  desktopFooter.style.visibility = 'visible';
                  
                  // Add padding to main content to prevent overlap
                  const contentArea = document.querySelector('.desktop-content-area');
                  if (contentArea) {
                    contentArea.style.paddingBottom = '40px';
                  }
                }
              }
              
              // Run on load and viewport changes
              window.addEventListener('load', ensureFootersVisible);
              window.addEventListener('resize', ensureFootersVisible);
              window.addEventListener('scroll', ensureFootersVisible);
              window.addEventListener('orientationchange', ensureFootersVisible);
              
              // Run periodically to catch any issues with dynamic content
              setInterval(ensureFootersVisible, 1000);
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
