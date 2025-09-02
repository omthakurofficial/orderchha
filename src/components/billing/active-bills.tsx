
'use client';

import { useApp } from "@/context/app-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { TableCard } from "../tables/table-card";

export function ActiveBills() {
    const { tables, billingOrders, isLoaded, refreshDataFromDatabase } = useApp();

    // Use defensive programming with a fallback
    const availableTables = tables || [];
    
    const tablesInBilling = useMemo(() => {
        // Find tables that have orders ready for billing
        const tablesWithBillingOrders = billingOrders.map(order => order.tableId);
        const uniqueTableIds = [...new Set(tablesWithBillingOrders)];
        
        // Return tables that have billing orders
        return availableTables.filter(table => uniqueTableIds.includes(table.id));
    }, [availableTables, billingOrders]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Active Bills</CardTitle>
                        <CardDescription>Tables that are ready for payment.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={refreshDataFromDatabase}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!isLoaded ? (
                    <div className="text-center p-8">
                        <div className="animate-pulse">Loading tables...</div>
                    </div>
                ) : tablesInBilling.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">
                        <p>No tables are currently waiting for a bill.</p>
                        <p className="text-xs mt-2">Debug: {billingOrders.length} billing orders, {tables.filter(t => t.status === 'billing').length} tables with billing status</p>
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
