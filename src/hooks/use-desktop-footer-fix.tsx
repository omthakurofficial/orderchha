'use client';

import { useEffect } from 'react';

export function useDesktopFooterFix() {
  useEffect(() => {
    // Mark body to help with CSS selectors
    document.body.classList.add('has-sidebar');
    
    // Fix for sidebar layout issues with the footer
    const fixSidebarLayout = () => {
      // Only apply on desktop
      if (window.innerWidth <= 768) {
        return;
      }
      
      // Fix the sidebar height and appearance
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      if (sidebar) {
        const sidebarElement = sidebar as HTMLElement;
        sidebarElement.style.height = 'calc(100vh - 30px)';
        sidebarElement.style.paddingBottom = '30px';
        sidebarElement.style.borderRight = '1px solid rgba(229, 231, 235, 1)';
        sidebarElement.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
        sidebarElement.style.overflow = 'hidden';
        sidebarElement.style.position = 'fixed';
        sidebarElement.style.left = '0';
        sidebarElement.style.top = '0';
        sidebarElement.style.width = '260px';
        sidebarElement.style.minWidth = '260px';
        sidebarElement.style.transform = 'none';
        sidebarElement.style.opacity = '1';
        sidebarElement.style.visibility = 'visible';
        sidebarElement.style.zIndex = '30';
      }
      
      // Fix the sidebar inset content (main content area)
      const sidebarInset = document.querySelector('.sidebar-inset');
      if (sidebarInset) {
        const insetElement = sidebarInset as HTMLElement;
        insetElement.style.minHeight = 'calc(100vh - 30px)';
        insetElement.style.paddingBottom = '30px';
        insetElement.style.overflow = 'auto';
        insetElement.style.marginLeft = '260px';
        insetElement.style.width = 'calc(100% - 260px)';
      }
      
      // Fix the sidebar menu items to match the dashboard style
      const menuItems = document.querySelectorAll('[data-sidebar="sidebar"] a');
      menuItems.forEach((item) => {
        const menuItem = item as HTMLElement;
        menuItem.style.borderRadius = '4px';
        menuItem.style.margin = '2px 0';
        menuItem.style.transition = 'all 0.2s';
      });
    };
    
    // Create a direct DOM element for the footer to ensure it shows at all zoom levels
    const createFixedFooter = () => {
      // First remove any existing fixed footer
      const existingFooter = document.getElementById('fixed-desktop-footer');
      if (existingFooter) {
        existingFooter.remove();
      }
      
      // Only add on desktop
      if (window.innerWidth <= 768) {
        return;
      }
      
      // Create new footer element with inline styles to guarantee visibility
      const footer = document.createElement('div');
      footer.id = 'fixed-desktop-footer';
      
      // Apply styles directly to ensure they override anything else
      const footerStyles = {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        height: '30px',
        backgroundColor: 'rgb(249, 250, 251)',
        borderTop: '1px solid rgb(229, 231, 235)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        zIndex: '9999',
        color: 'rgb(107, 114, 128)',
        fontSize: '12px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        visibility: 'visible',
        opacity: '1',
        transform: 'none',
        overflow: 'visible',
        margin: '0',
        pointerEvents: 'auto'
      };
      
      // Apply all styles
      Object.assign(footer.style, footerStyles);
      
      // Add the text content
      const contentSpan = document.createElement('span');
      contentSpan.innerText = 'Software developed by ';
      footer.appendChild(contentSpan);
      
      const companyName = document.createElement('strong');
      companyName.innerText = 'Giant Infosys Pvt. Ltd.';
      companyName.style.fontWeight = '600';
      footer.appendChild(companyName);
      
      // Add to document body
      document.body.appendChild(footer);
      
      // Force a layout calculation
      footer.getBoundingClientRect();
      
      // Fix sidebar layout after footer is added
      fixSidebarLayout();
    };
    
    // Initial setup
    createFixedFooter();
    
    // Set up event listeners
    const handleResize = () => {
      createFixedFooter();
      fixSidebarLayout();
    };
    
    const handleScroll = () => {
      const footer = document.getElementById('fixed-desktop-footer');
      if (footer && window.innerWidth > 768) {
        footer.style.position = 'fixed';
        footer.style.bottom = '0';
        footer.style.visibility = 'visible';
        footer.style.display = 'flex';
      }
      fixSidebarLayout();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Periodic check to ensure everything stays in place
    const visibilityCheckInterval = setInterval(() => {
      if (window.innerWidth > 768) {
        const footer = document.getElementById('fixed-desktop-footer');
        if (!footer) {
          createFixedFooter();
        }
        fixSidebarLayout();
      }
    }, 2000);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(visibilityCheckInterval);
      const footer = document.getElementById('fixed-desktop-footer');
      if (footer) {
        footer.remove();
      }
      document.body.classList.remove('has-sidebar');
    };
  }, []);
}
