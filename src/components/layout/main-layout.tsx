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
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Sidebar - Desktop Only */}
      {!isMobile && (
        <aside className="main-sidebar">
          <AppSidebar isCollapsed={sidebarCollapsed} />
        </aside>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        {/* Navbar */}
        <AppNavbar 
          onSidebarToggle={handleSidebarToggle}
          showSidebarToggle={!isMobile}
        />

        {/* Page Content */}
        <main className="page-content">
          <div className="page-content-inner">
            {children}
          </div>
        </main>

        {/* Footer - Desktop Only */}
        {!isMobile && <AppFooter />}
      </div>

      {/* Mobile Footer Navigation */}
      {isMobile && <MobileFooterNavigation />}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && !sidebarCollapsed && (
        <>
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarCollapsed(true)}
          />
          <aside className="main-sidebar mobile-sidebar">
            <AppSidebar isCollapsed={false} />
          </aside>
        </>
      )}
    </div>
  );
}
