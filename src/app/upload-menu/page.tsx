
'use client';

import { MenuUploadForm } from "@/components/menu/menu-upload-form";
import { useApp } from "@/context/app-context";
import { MENU } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UploadMenuPage() {
    const { currentUser } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (currentUser?.role !== 'admin' && currentUser?.role !== 'cashier') {
            router.push('/');
        }
    }, [currentUser, router]);
    
    const categories = MENU.map(cat => cat.name);

    if (currentUser?.role !== 'admin' && currentUser?.role !== 'cashier') {
        return (
            <div className="flex items-center justify-center h-full">
                <p>You do not have permission to view this page.</p>
            </div>
        )
    }
  
    return (
    <div className="flex flex-col h-full">
        <header className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm">
          <h1 className="text-2xl font-bold font-headline text-slate-900">Menu Management</h1>
          <p className="mt-1 text-sm text-slate-600">Add new dishes to your digital menu with rich details and clean visuals.</p>
      </header>
        <main className="flex flex-1 justify-center p-4 md:p-6">
        <MenuUploadForm categories={categories} />
      </main>
    </div>
  );
}
