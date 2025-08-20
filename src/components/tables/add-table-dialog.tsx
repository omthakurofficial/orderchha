
'use client';

import { useState, useEffect } from 'react';
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
import { PlusCircle, Edit } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import type { Table } from '@/types';

const tableFormSchema = z.object({
  name: z.string().min(1, { message: "Table name is required." }),
  capacity: z.coerce.number().int().positive({ message: "Capacity must be a positive number." }).min(1, { message: "Table must have at least 1 seat."}),
  location: z.string().min(1, { message: "Location is required." }),
});

type TableFormValues = z.infer<typeof tableFormSchema>;

interface AddTableDialogProps {
    table?: Table;
    trigger?: React.ReactNode;
}

export function AddTableDialog({ table, trigger }: AddTableDialogProps) {
  const [open, setOpen] = useState(false);
  const { addTable, updateTable } = useApp();
  const { toast } = useToast();
  const isEditMode = !!table;

  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      name: '',
      capacity: 2,
      location: 'Indoors',
    },
  });

  useEffect(() => {
    if (table) {
      form.reset(table);
    } else {
        form.reset({
            name: '',
            capacity: 2,
            location: 'Indoors',
        });
    }
  }, [table, form]);

  const onSubmit: SubmitHandler<TableFormValues> = (data) => {
    if (isEditMode) {
        updateTable(table.id, data);
        toast({
            title: 'Table Updated',
            description: `Table ${data.name} has been updated.`,
        });
    } else {
        addTable(data);
        toast({
            title: 'Table Added',
            description: `A new table named ${data.name} has been added.`,
        });
    }
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
             <Button>
                <PlusCircle />
                Add New Table
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Table' : 'Add a New Table'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Update the details for ${table.name}.` : 'Enter the details for the new table.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Table 1, Patio Booth" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (Seats)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Indoors, Patio, Upstairs" {...field} />
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
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Add Table'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
