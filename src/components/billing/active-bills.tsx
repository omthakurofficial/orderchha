
'use client';

import { useApp } from "@/context/app-context-supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { TableCard } from "../tables/table-card";

export function ActiveBills() {
    const { tables } = useApp();

    const tablesInBilling = useMemo(() => {
        return tables.filter(t => t.status === 'billing');
    }, [tables]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Bills</CardTitle>
                <CardDescription>Tables that are ready for payment.</CardDescription>
            </CardHeader>
            <CardContent>
                 {tablesInBilling.length === 0 ? (
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
    )
}
