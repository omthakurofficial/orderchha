"use client";

import { useEffect } from 'react';

export function useMobileNavigation() {
  useEffect(() => {
    // Only prevent multi-touch zoom, allow all other interactions
    const preventZoom = (e: TouchEvent) => {
      // Only prevent zoom if more than 1 finger is touching
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Add zoom prevention styles - less aggressive approach
    const style = document.createElement('style');
    style.id = 'mobile-navigation-styles';
    style.textContent = `
      @media (max-width: 767.98px) {
        html {
          -webkit-text-size-adjust: 100% !important;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        
        [data-mobile-footer] {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 50 !important;
          background-color: white !important;
          display: block !important;
        }
        
        [data-mobile-footer] a {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        /* Prevent zoom on inputs to avoid viewport issues */
        input, select, textarea {
          font-size: 16px !important;
        }
      }
      
      @media (min-width: 768px) {
        [data-mobile-footer] {
          display: none !important;
        }
      }
    `;
    
    // Remove existing style if present
    const existingStyle = document.getElementById('mobile-navigation-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);

    // Only add touchstart listener for multi-touch zoom prevention
    document.addEventListener('touchstart', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventZoom);
      
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
}
