
'use client';

import { AddInventoryItemDialog } from "@/components/inventory/add-inventory-item-dialog";
import { InventoryList } from "@/components/inventory/inventory-list";
import { useApp } from "@/context/app-context";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function InventoryPage() {
    const { currentUser } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            router.push('/');
        }
    }, [currentUser, router]);

    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-full">
                <p>You do not have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <Package />
                        Inventory Management
                    </h1>
                    <p className="text-muted-foreground">Track and manage your cafe's stock levels.</p>
                </div>
                <AddInventoryItemDialog />
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
                <InventoryList />
            </main>
        </div>
    );
}
