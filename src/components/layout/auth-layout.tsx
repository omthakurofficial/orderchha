
'use client';

import { useApp } from "@/context/app-context";
import { AppShell } from "./app-shell";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    const { isLoaded } = useApp();

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading application...</p>
            </div>
        );
    }

    // Since authentication is removed, we wrap the content in AppShell if data is loaded.
    // Receipt page is standalone.
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/receipt')) {
        return <main>{children}</main>;
    }

    return <AppShell>{children}</AppShell>;
}
