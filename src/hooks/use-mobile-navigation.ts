"use client";

import { useEffect } from 'react';

export function useMobileNavigation() {
  useEffect(() => {
    let lastTouchEnd = 0;
    let preventZoomTimeout: NodeJS.Timeout;
    
    // Enhanced zoom prevention
    const preventZoom = (e: Event) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
        e.stopPropagation();
      }
      lastTouchEnd = now;
    };
    
    // Prevent double-tap zoom on the entire footer
    const preventDoubleTab = (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (touchEvent.touches && touchEvent.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // Force footer to stay visible after any interaction
    const forceFooterVisible = () => {
      const footer = document.querySelector('[data-mobile-footer]');
      if (footer) {
        const footerElement = footer as HTMLElement;
        footerElement.style.position = 'fixed';
        footerElement.style.bottom = '0';
        footerElement.style.left = '0';
        footerElement.style.right = '0';
        footerElement.style.zIndex = '9999';
        footerElement.style.opacity = '1';
        footerElement.style.visibility = 'visible';
        footerElement.style.display = 'block';
      }
    };
    
    // Enhanced event listeners
    const footerElements = document.querySelectorAll('[data-mobile-footer] a');
    const footer = document.querySelector('[data-mobile-footer]');
    
    footerElements.forEach(element => {
      element.addEventListener('touchend', preventZoom, { passive: false });
      element.addEventListener('touchstart', preventZoom, { passive: false });
      element.addEventListener('click', forceFooterVisible);
    });
    
    if (footer) {
      footer.addEventListener('touchstart', preventDoubleTab, { passive: false });
      footer.addEventListener('touchend', forceFooterVisible);
    }
    
    // Enhanced CSS for zoom prevention and footer stability
    const style = document.createElement('style');
    style.id = 'mobile-navigation-styles';
    style.textContent = `
      @media (max-width: 768px) {
        /* Prevent zoom on all form elements */
        input, select, textarea, button {
          font-size: 16px !important;
          -webkit-text-size-adjust: 100%;
          -webkit-touch-callout: none;
        }
        
        /* Aggressive zoom prevention */
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="number"],
        input[type="tel"],
        input[type="url"],
        input[type="search"],
        textarea,
        select {
          font-size: 16px !important;
          transform: scale(1) !important;
          zoom: 1 !important;
        }
        
        /* Mobile footer ultra-stable */
        [data-mobile-footer] {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 9999 !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-transform: translateZ(0) !important;
          transform: translateZ(0) !important;
          will-change: auto !important;
          backface-visibility: hidden !important;
          -webkit-backface-visibility: hidden !important;
        }
        
        /* Prevent page zoom */
        html {
          -webkit-text-size-adjust: 100% !important;
          -moz-text-size-adjust: 100% !important;
          -ms-text-size-adjust: 100% !important;
          text-size-adjust: 100% !important;
        }
        
        /* Force footer visibility on viewport changes */
        @media screen and (orientation: portrait) {
          [data-mobile-footer] {
            position: fixed !important;
            bottom: 0 !important;
            opacity: 1 !important;
            display: block !important;
          }
        }
        
        @media screen and (orientation: landscape) {
          [data-mobile-footer] {
            position: fixed !important;
            bottom: 0 !important;
            opacity: 1 !important;
            display: block !important;
          }
        }
      }
    `;
    
    // Remove existing style if present
    const existingStyle = document.getElementById('mobile-navigation-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    
    // Force footer visible on load
    setTimeout(forceFooterVisible, 100);
    
    // Monitor viewport changes and force footer visible
    const handleViewportChange = () => {
      clearTimeout(preventZoomTimeout);
      preventZoomTimeout = setTimeout(forceFooterVisible, 100);
    };
    
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    
    return () => {
      footerElements.forEach(element => {
        element.removeEventListener('touchend', preventZoom);
        element.removeEventListener('touchstart', preventZoom);
        element.removeEventListener('click', forceFooterVisible);
      });
      
      if (footer) {
        footer.removeEventListener('touchstart', preventDoubleTab);
        footer.removeEventListener('touchend', forceFooterVisible);
      }
      
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      
      clearTimeout(preventZoomTimeout);
      
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
}
