
'use client';

import { useApp } from "@/context/app-context";
import { AppShell } from "./app-shell";
import LoginPage from "@/app/login/page";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoaded } = useApp();

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading application...</p>
            </div>
        );
    }

    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/receipt')) {
        return <main>{children}</main>;
    }

    if (!currentUser) {
        return <LoginPage />;
    }

    return <AppShell>{children}</AppShell>;
}
