
'use client';

import { useApp } from "@/context/app-context-supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Package, Plus, Minus, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { UpdateStockDialog } from "./update-stock-dialog";
import { useMemo, useState } from "react";
import type { InventoryItem } from "@/types";
import type { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface InventoryListProps {
    searchTerm: string;
    categoryFilter: string;
    dateRange?: DateRange;
}

export function InventoryList({ searchTerm, categoryFilter, dateRange }: InventoryListProps) {
    const { inventory, deleteInventoryItem } = useApp();
    const [dialogItem, setDialogItem] = useState<{ item: InventoryItem; mode: 'add' | 'reduce' } | null>(null);

    const getStockStatusColor = (stock: number, threshold: number) => {
        const percentage = (stock / (threshold * 3)) * 100; // Assume 'full' is 3x threshold
        if (stock <= threshold) return 'bg-red-500'; // Low stock
        if (percentage < 50) return 'bg-yellow-500'; // Medium stock
        return 'bg-green-500'; // Healthy stock
    };

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;

            const dateMatch = !dateRange || !dateRange.from || !dateRange.to || isWithinInterval(new Date(item.lastUpdated), { start: dateRange.from, end: dateRange.to });

            return nameMatch && categoryMatch && dateMatch;
        });
    }, [inventory, searchTerm, categoryFilter, dateRange]);

    if (inventory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-muted/40 h-64">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-muted-foreground">No Inventory Items Found</h2>
                <p className="text-muted-foreground">Add a new item to start tracking your stock.</p>
          </div>
        )
    }

    if (filteredInventory.length === 0) {
         return (
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-muted/40 h-64">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-muted-foreground">No Items Match Your Search</h2>
                <p className="text-muted-foreground">Try different filter combinations.</p>
          </div>
        )
    }

    return (
        <>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Purchase Price</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredInventory.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">{item.category}</Badge>
                            </TableCell>
                            <TableCell>
                                <span className="font-bold">{item.stock}</span>
                                <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                            </TableCell>
                            <TableCell>NPR {item.purchasePrice.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">NPR {(item.stock * item.purchasePrice).toFixed(2)}</TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                    <Progress 
                                        value={(item.stock / (item.lowStockThreshold * 3)) * 100} 
                                        className="w-24 h-2"
                                        indicatorClassName={getStockStatusColor(item.stock, item.lowStockThreshold)}
                                    />
                                     {item.stock <= item.lowStockThreshold && (
                                        <Badge variant="destructive" className="text-xs">Low</Badge>
                                    )}
                               </div>
                            </TableCell>
                            <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setDialogItem({ item, mode: 'add' })}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Stock
                                        </DropdownMenuItem>
                                         <DropdownMenuItem onSelect={() => setDialogItem({ item, mode: 'reduce' })}>
                                            <Minus className="mr-2 h-4 w-4" />
                                            Reduce Stock
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                     <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Item
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the inventory item "{item.name}".
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteInventoryItem(item.id)}>
                                                    Continue
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        {dialogItem && (
            <UpdateStockDialog 
                isOpen={!!dialogItem}
                onOpenChange={(open) => !open && setDialogItem(null)}
                item={dialogItem.item}
                mode={dialogItem.mode}
            />
        )}
        </>
    );
}
