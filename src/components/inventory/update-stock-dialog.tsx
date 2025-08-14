
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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import type { InventoryItem } from '@/types';

const updateStockSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number."),
});

type UpdateStockFormValues = z.infer<typeof updateStockSchema>;

interface UpdateStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
  mode: 'add' | 'reduce';
}

export function UpdateStockDialog({ isOpen, onOpenChange, item, mode }: UpdateStockDialogProps) {
  const { updateInventoryItemStock } = useApp();
  
  const form = useForm<UpdateStockFormValues>({
    resolver: zodResolver(updateStockSchema),
    defaultValues: {
      amount: 1,
    },
  });

  const onSubmit: SubmitHandler<UpdateStockFormValues> = async (data) => {
    const amountToChange = mode === 'add' ? data.amount : -data.amount;
    await updateInventoryItemStock(item.id, amountToChange);
    form.reset();
    onOpenChange(false);
  };
  
  const title = mode === 'add' ? 'Add Stock' : 'Reduce Stock';
  const description = `Update the stock quantity for ${item.name}. Current stock: ${item.stock} ${item.unit}.`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to {mode}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
