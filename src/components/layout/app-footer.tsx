'use client';

import React from 'react';

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  return (
    <footer className={`mt-4 rounded-xl border border-slate-200/80 bg-white/75 px-4 py-2 shadow-sm backdrop-blur ${className}`}>
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <p>
            Software developed by <strong className="font-semibold text-slate-700">Giant Infosys Pvt. Ltd.</strong>
          </p>
        </div>
        <div>
          <p className="font-medium">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
