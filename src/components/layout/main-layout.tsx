'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { AppSidebar } from './app-sidebar';
import { AppNavbar } from './app-navbar';
import { AppFooter } from './app-footer';
import { MobileFooterNavigation } from './mobile-footer-navigation';
import { useOrderEventNotifications } from '@/hooks/use-order-event-notifications';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize order event notifications
  useOrderEventNotifications();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Don't render if user is not loaded
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-surface rounded-2xl px-8 py-6 text-sm font-medium text-slate-600">
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 md:pb-12">
      {!isMobile && (
        <aside className="fixed inset-y-4 left-4 z-30">
          <AppSidebar isCollapsed={sidebarCollapsed} />
        </aside>
      )}

      <div
        className={`transition-all duration-300 ${
          isMobile ? 'px-3 pt-3' : sidebarCollapsed ? 'pl-[7.25rem] pr-4 pt-4' : 'pl-[18.5rem] pr-4 pt-4'
        }`}
      >
        <AppNavbar 
          onSidebarToggle={handleSidebarToggle}
          showSidebarToggle={!isMobile}
        />

        <main className="mt-4">
          <div className="app-section min-h-[calc(100vh-12.5rem)]">
            {children}
          </div>
        </main>

        {!isMobile && <AppFooter />}
      </div>

      {isMobile && <MobileFooterNavigation />}
    </div>
  );
}
