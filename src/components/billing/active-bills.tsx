
'use client';

import { useApp } from "@/context/app-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import Link from "next/link";
import { TableCard } from "../tables/table-card";

export function ActiveBills() {
    const { tables, kitchenOrders } = useApp();

    const tablesInBilling = useMemo(() => {
        return tables.filter(t => t.status === 'billing');
    }, [tables]);

    const bills = useMemo(() => {
        return tablesInBilling.map(table => {
            const ordersForTable = kitchenOrders.filter(o => o.tableId === table.id && o.status === 'completed');
            const subtotal = ordersForTable.reduce((acc, order) => acc + order.total, 0);
            const total = subtotal * 1.13; // with VAT
            return {
                table,
                total,
                hasOrders: ordersForTable.length > 0
            };
        });
    }, [tablesInBilling, kitchenOrders]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Bills</CardTitle>
                <CardDescription>Tables that are ready for payment.</CardDescription>
            </CardHeader>
            <CardContent>
                 {bills.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">
                        <p>No tables are currently waiting for a bill.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {bills.map(({ table }) => (
                            <TableCard key={table.id} table={table} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
