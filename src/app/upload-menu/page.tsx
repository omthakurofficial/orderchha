
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
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline">Menu Management</h1>
        <p className="text-muted-foreground">Add new items to your digital menu.</p>
      </header>
      <main className="flex-1 p-4 md:p-6 flex justify-center items-start">
        <MenuUploadForm categories={categories} />
      </main>
    </div>
  );
}
