
'use client';

import { useApp } from "@/context/app-context";
import { AppShell } from "./app-shell";
import LoginPage from "@/app/login/page";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoaded } = useApp();
    const router = useRouter();
    const [loadTimeout, setLoadTimeout] = useState(false);

    useEffect(() => {
        // If loading takes more than 5 seconds, show diagnostic option
        const timer = setTimeout(() => {
            setLoadTimeout(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    // Public routes that don't require auth
    const isPublicRoute = typeof window !== 'undefined' && (
        window.location.pathname.startsWith('/receipt') || 
        window.location.pathname.startsWith('/debug')
    );

    if (isPublicRoute) {
        return <div className="flex flex-col h-screen">{children}</div>;
    }

    if (!isLoaded) {
        return (
            <div className="flex flex-col h-screen items-center justify-center p-4">
                <div className="text-center">
                    <p className="mb-4 text-lg">Loading application...</p>
                    
                    {loadTimeout && (
                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md max-w-md mx-auto">
                            <p className="text-yellow-800 mb-4">It's taking longer than expected to load the application.</p>
                            <p className="text-sm text-yellow-700 mb-4">This might indicate connectivity issues with our backend services.</p>
                            
                            <div className="flex justify-center space-x-4">
                                <Button 
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </Button>
                                <Button 
                                    onClick={() => router.push('/debug')}
                                >
                                    Diagnose Issues
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <LoginPage />;
    }

    return <AppShell>{children}</AppShell>;
}
