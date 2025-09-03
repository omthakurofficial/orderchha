'use client';

import React from 'react';

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  return (
    <footer className={`app-footer ${className}`}>
      <div className="app-footer-content">
        <div className="app-footer-left">
          <p className="app-footer-text">
            Software developed by <strong className="app-footer-company">Giant Infosys Pvt. Ltd.</strong>
          </p>
        </div>
        <div className="app-footer-right">
          <p className="app-footer-version">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
