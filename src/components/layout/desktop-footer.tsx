'use client';

import React, { useEffect, useRef } from "react";

export function DesktopFooter() {
  const footerRef = useRef<HTMLElement>(null);

  // Ensure footer is visible on mount and after any re-renders
  useEffect(() => {
    const ensureFooterVisible = () => {
      if (footerRef.current && window.innerWidth > 768) {
        const footer = footerRef.current;
        footer.style.position = 'fixed';
        footer.style.bottom = '0';
        footer.style.left = '0';
        footer.style.right = '0';
        footer.style.zIndex = '40';
        footer.style.visibility = 'visible';
        footer.style.display = 'block';
        
        // Ensure sidebar extends to footer
        const sidebar = document.querySelector('[data-sidebar="sidebar"]');
        if (sidebar) {
          (sidebar as HTMLElement).style.height = 'calc(100vh - 30px)';
          (sidebar as HTMLElement).style.paddingBottom = '30px';
        }
        
        // Fix the content area margin
        const contentArea = document.querySelector('.sidebar-inset');
        if (contentArea) {
          (contentArea as HTMLElement).style.minHeight = 'calc(100vh - 30px)';
          (contentArea as HTMLElement).style.paddingBottom = '30px';
        }
      }
    };

    ensureFooterVisible();
    
    // Also ensure it's visible on resize and zoom
    window.addEventListener('resize', ensureFooterVisible);
    window.addEventListener('scroll', ensureFooterVisible);
    
    // Check periodically to ensure visibility
    const interval = setInterval(ensureFooterVisible, 1000);
    
    return () => {
      window.removeEventListener('resize', ensureFooterVisible);
      window.removeEventListener('scroll', ensureFooterVisible);
      clearInterval(interval);
    };
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="hidden md:block desktop-footer py-2 px-4 text-center text-gray-500 text-xs border-t bg-gray-50"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40
      }}
    >
      <div className="flex items-center justify-center">
        <p>Software developed by <span className="font-medium">Giant Infosys Pvt. Ltd.</span></p>
      </div>
    </footer>
  );
}
