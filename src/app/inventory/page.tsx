
'use client';

import { AddInventoryItemDialog } from "@/components/inventory/add-inventory-item-dialog";
import { InventoryList } from "@/components/inventory/inventory-list";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/app-context";
import { Package, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function InventoryPage() {
    const { currentUser } = useApp();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

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
            <header className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <Package />
                        Inventory Management
                    </h1>
                    <p className="text-muted-foreground">Track and manage your cafe's stock levels.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                         <Input 
                            type="search"
                            placeholder="Search by item name..."
                            className="pl-8 sm:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <AddInventoryItemDialog />
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
                <InventoryList searchTerm={searchTerm} />
            </main>
        </div>
    );
}
