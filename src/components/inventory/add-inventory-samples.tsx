import React, { useState } from 'react';
import { AddInventoryItemDialog } from "@/components/inventory/add-inventory-item-dialog";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle } from "lucide-react";
import { useApp } from "@/context/app-context";

// Sample inventory items with properly typed units
const sampleInventoryItems = [
  {
    name: 'Coffee Beans (Arabica)',
    category: 'Beverages',
    stock: 25,
    unit: 'kg' as const,
    purchasePrice: 1200,
    lowStockThreshold: 5
  },
  {
    name: 'Milk',
    category: 'Dairy',
    stock: 50,
    unit: 'ltr' as const,
    purchasePrice: 120,
    lowStockThreshold: 10
  },
  {
    name: 'Sugar',
    category: 'Groceries',
    stock: 30,
    unit: 'kg' as const,
    purchasePrice: 85,
    lowStockThreshold: 8
  },
  {
    name: 'Tea Leaves',
    category: 'Beverages',
    stock: 15,
    unit: 'kg' as const,
    purchasePrice: 950,
    lowStockThreshold: 3
  },
  {
    name: 'Disposable Cups',
    category: 'Supplies',
    stock: 500,
    unit: 'pcs' as const,
    purchasePrice: 5,
    lowStockThreshold: 100
  }
];

export function AddInventorySamples() {
  const { addInventoryItem } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddSampleItems = async () => {
    try {
      setIsAdding(true);
      
      // Add each inventory item with a small delay between them
      for (const item of sampleInventoryItems) {
        await addInventoryItem(item);
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between items
      }
      alert('Successfully added 5 sample inventory items!');
      window.location.reload(); // Reload to show the items
    } catch (err) {
      console.error('Failed to add sample inventory items:', err);
      alert('Failed to add sample inventory items. Check console for details.');
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <AddInventoryItemDialog />
        
        <Button 
          onClick={handleAddSampleItems} 
          variant="secondary"
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Sample Items
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
