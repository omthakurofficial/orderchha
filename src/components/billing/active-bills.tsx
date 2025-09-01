
'use client';

import { useApp } from "@/context/app-context-supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { TableCard } from "../tables/table-card";

export function ActiveBills() {
    const { tables, isLoaded } = useApp();

    // Use defensive programming with a fallback
    const availableTables = tables || [];
    
    const tablesInBilling = useMemo(() => {
        return availableTables.filter(t => t && t.status === 'cleaning');
    }, [availableTables]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Bills</CardTitle>
                <CardDescription>Tables that are ready for payment.</CardDescription>
            </CardHeader>
            <CardContent>
                {!isLoaded ? (
                    <div className="text-center p-8">
                        <div className="animate-pulse">Loading tables...</div>
                    </div>
                ) : tablesInBilling.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">
                        <p>No tables are currently waiting for a bill.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {tablesInBilling.map(table => (
                            <TableCard key={table.id} table={table} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
