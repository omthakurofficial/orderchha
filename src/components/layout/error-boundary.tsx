'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ componentStack: string } | null>(null);

  useEffect(() => {
    // Add global error handler for uncaught exceptions
    const errorHandler = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
      setHasError(true);
      setError(event.error);
    };

    // Add handler for unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event.reason);
      setHasError(true);
      setError(new Error(event.reason.message || 'Unknown promise rejection'));
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  const handleResetError = () => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
    window.location.href = '/';
  };

  if (hasError) {
    // Render fallback UI when an error occurs
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          
          <div className="bg-red-50 p-4 rounded mb-4 overflow-auto max-h-40">
            <p className="font-mono text-sm text-red-800">
              {error?.toString() || 'Unknown error'}
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button 
              onClick={handleResetError}
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
