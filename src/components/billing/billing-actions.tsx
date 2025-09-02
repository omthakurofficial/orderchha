'use client';

import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context-supabase";
import { Wallet, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Table } from "@/types";

export function BillingActions() {
  const { tables, updateTableStatus } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Find tables with occupied status - these are candidates for billing
  const occupiedTables = tables.filter(t => t.status === 'occupied');

  // Set a table to billing status
  const setTableToBilling = async (tableId: number) => {
    setLoading(true);
    try {
      await updateTableStatus(tableId, 'billing');
      toast({
        title: "Table Ready for Billing",
        description: `Table ${tableId} is now ready for payment processing.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update table status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (occupiedTables.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 border rounded-lg bg-card">
      <h2 className="text-lg font-medium mb-3">Quick Billing Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {occupiedTables.map(table => (
          <Button 
            key={table.id}
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => setTableToBilling(table.id)}
            disabled={loading}
          >
            <Wallet className="h-4 w-4" />
            <span>Bill Table {table.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
