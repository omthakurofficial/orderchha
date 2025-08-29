
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { useApp } from '@/context/app-context-supabase';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { InventoryItem } from '@/types';

const inventoryItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  category: z.string().min(2, "Category is required."),
  stock: z.coerce.number().min(0, "Stock cannot be negative."),
  unit: z.enum(['kg', 'g', 'ltr', 'ml', 'pcs', 'pack']),
  purchasePrice: z.coerce.number().positive("Purchase price must be a positive number."),
  lowStockThreshold: z.coerce.number().positive("Threshold must be a positive number."),
});

type InventoryFormValues = z.infer<typeof inventoryItemSchema>;

export function AddInventoryItemDialog() {
  const [open, setOpen] = useState(false);
  const { addInventoryItem } = useApp();
  const { toast } = useToast();

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: '',
      category: '',
      stock: 0,
      unit: 'pcs',
      purchasePrice: 0,
      lowStockThreshold: 10,
    },
  });

  const onSubmit: SubmitHandler<InventoryFormValues> = async (data) => {
    try {
        await addInventoryItem(data);
        toast({
            title: 'Inventory Item Added',
            description: `${data.name} has been added to your inventory.`,
        });
        form.reset();
        setOpen(false);
    } catch (error) {
        console.error("Failed to add inventory item", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add the item to inventory.',
        })
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Enter the details for a new item to track in your stock.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coffee Beans, Milk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries, Drinks, Supplies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Initial Stock</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                <SelectItem value="g">Grams (g)</SelectItem>
                                <SelectItem value="ltr">Liters (ltr)</SelectItem>
                                <SelectItem value="ml">Milliliters (ml)</SelectItem>
                                <SelectItem value="pack">Packs (pack)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
             <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price (per unit)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
