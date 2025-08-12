
'use client';

import { useApp } from "@/context/app-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "./app-shell";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    const { currentUser, isAuthLoading } = useApp();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isAuthLoading) return;

        const isLoginPage = pathname === '/login';
        const isReceiptPage = pathname.startsWith('/receipt');

        if (!currentUser && !isLoginPage && !isReceiptPage) {
            router.push('/login');
        } else if (currentUser && isLoginPage) {
            router.push('/');
        }

    }, [currentUser, isAuthLoading, router, pathname]);

    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading application...</p>
            </div>
        );
    }
    
    const isLoginPage = pathname === '/login';
    const isReceiptPage = pathname.startsWith('/receipt');

    if (isLoginPage || isReceiptPage) {
        return <main>{children}</main>;
    }

    if (currentUser) {
       return <AppShell>{children}</AppShell>
    }

    return null;
}
