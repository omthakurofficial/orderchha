"use client";

import { useEffect } from 'react';

export function useMobileNavigation() {
  useEffect(() => {
    // Prevent zoom on double tap for mobile footer
    let lastTouchEnd = 0;
    
    const preventZoom = (e: Event) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    // Prevent zoom on mobile footer elements
    const footerElements = document.querySelectorAll('[data-mobile-footer] a');
    
    footerElements.forEach(element => {
      element.addEventListener('touchend', preventZoom, { passive: false });
    });
    
    // Set minimum font size to prevent zoom
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        input, select, textarea, button {
          font-size: 16px !important;
        }
        
        /* Prevent iOS zoom */
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
        }
        
        /* Mobile footer specific styles */
        [data-mobile-footer] {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      footerElements.forEach(element => {
        element.removeEventListener('touchend', preventZoom);
      });
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
}
