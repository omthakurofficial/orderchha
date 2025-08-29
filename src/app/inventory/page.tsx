
'use client';

import { AddInventoryItemDialog } from "@/components/inventory/add-inventory-item-dialog";
import { InventoryList } from "@/components/inventory/inventory-list";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/app-context-supabase";
import { Package, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";


export default function InventoryPage() {
    const { currentUser, inventory } = useApp();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            router.push('/');
        }
    }, [currentUser, router]);

    const inventoryCategories = useMemo(() => {
        const categories = new Set(inventory.map(item => item.category));
        return ['all', ...Array.from(categories)];
    }, [inventory]);

    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-full">
                <p>You do not have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                            <Package />
                            Inventory Management
                        </h1>
                        <p className="text-muted-foreground">Track and manage your cafe's stock levels.</p>
                    </div>
                    <div className="hidden md:block">
                        <AddInventoryItemDialog />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                    <div className="relative flex-1 md:flex-grow-0">
                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                         <Input 
                            type="search"
                            placeholder="Search by item name..."
                            className="pl-8 w-full md:w-[250px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            {inventoryCategories.map(cat => (
                                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DateRangePicker onDateChange={setDateRange} />
                    <div className="block md:hidden">
                        <AddInventoryItemDialog />
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
                <InventoryList 
                    searchTerm={searchTerm} 
                    categoryFilter={categoryFilter}
                    dateRange={dateRange}
                />
            </main>
        </div>
    );
}
