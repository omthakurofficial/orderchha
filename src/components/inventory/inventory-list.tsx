
'use client';

import { useApp } from "@/context/app-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Package, Plus, Minus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function InventoryList() {
    const { inventory } = useApp();

    const getStockStatusColor = (stock: number, threshold: number) => {
        const percentage = (stock / (threshold * 3)) * 100; // Assume 'full' is 3x threshold
        if (stock <= threshold) return 'bg-red-500'; // Low stock
        if (percentage < 50) return 'bg-yellow-500'; // Medium stock
        return 'bg-green-500'; // Healthy stock
    };

    if (inventory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-muted/40 h-64">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-muted-foreground">No Inventory Items Found</h2>
                <p className="text-muted-foreground">Add a new item to start tracking your stock.</p>
          </div>
        )
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inventory.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>
                                <span className="font-bold">{item.stock}</span>
                                <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                    <Progress 
                                        value={(item.stock / (item.lowStockThreshold * 3)) * 100} 
                                        className="w-24 h-2 [&>div]:bg-primary"
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
                                        <DropdownMenuItem>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Stock
                                        </DropdownMenuItem>
                                         <DropdownMenuItem>
                                            <Minus className="mr-2 h-4 w-4" />
                                            Reduce Stock
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

declare module 'react' {
    interface ComponentProps<T> {
        indicatorClassName?: string;
    }
}
