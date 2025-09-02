'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useApp } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const customerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits').optional().or(z.literal('')),
  address: z.string().optional(),
  creditBalance: z.coerce.number().default(0),
});

export default function CustomersPage() {
  const { users, addCustomer, updateCustomerCredit } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      address: '',
      creditBalance: 0,
    },
  });

  const customers = users.filter(user => user.isCustomer || user.creditBalance);
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (data: z.infer<typeof customerFormSchema>) => {
    try {
      await addCustomer({
        name: data.name,
        email: data.email || 'customer@example.com', // Default email for customers
        mobile: data.mobile,
        address: data.address,
        role: 'admin', // Default role, we'll filter by isCustomer instead
        creditBalance: data.creditBalance,
        isCustomer: true,
      }, null); // No photo file for customers
      
      form.reset();
      setOpen(false);
      
      toast({
        title: '✅ Customer Added',
        description: `${data.name} has been added to your customers.`,
      });
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to add customer.',
        variant: 'destructive',
      });
    }
  };

  const handleCreditAdjustment = async (type: 'add' | 'subtract') => {
    if (!selectedCustomer || !adjustmentAmount || isNaN(Number(adjustmentAmount))) {
      toast({
        title: '❌ Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    const amount = Number(adjustmentAmount);
    const finalAmount = type === 'add' ? amount : -amount;
    
    try {
      await updateCustomerCredit(selectedCustomer, finalAmount);
      
      toast({
        title: '✅ Balance Updated',
        description: `Customer credit has been ${type === 'add' ? 'increased' : 'decreased'} by ${Math.abs(finalAmount)}.`,
      });
      
      setSelectedCustomer(null);
      setAdjustmentAmount('');
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to adjust credit balance.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
          <UserPlus />
          Customers & Credit
        </h1>
        <p className="text-muted-foreground">Manage customers and track credit balances.</p>
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Add a new customer to your system. You can track their credit balance here.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="customer@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+977 98XXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creditBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Credit Balance</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Add Customer</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-2" disabled={!selectedCustomer}>
                Adjust Credit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Credit Balance</DialogTitle>
                <DialogDescription>
                  {selectedCustomer && 
                    `Update credit balance for ${customers.find(c => c.uid === selectedCustomer)?.name}.`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <FormLabel>Amount</FormLabel>
                  <Input 
                    type="number" 
                    value={adjustmentAmount} 
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    placeholder="Enter amount to adjust"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleCreditAdjustment('add')} 
                    disabled={!adjustmentAmount || !selectedCustomer}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Credit
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="secondary" 
                    onClick={() => handleCreditAdjustment('subtract')} 
                    disabled={!adjustmentAmount || !selectedCustomer}
                  >
                    <Minus className="mr-2 h-4 w-4" /> Subtract Credit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              Manage your customers and their credit balances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {searchTerm ? 'No customers match your search.' : 'No customers found. Add your first customer.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Credit Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.uid} 
                      className={customer.uid === selectedCustomer ? 'bg-muted' : ''}
                      onClick={() => setSelectedCustomer(customer.uid === selectedCustomer ? null : customer.uid)}
                    >
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        {customer.mobile && <div>{customer.mobile}</div>}
                        {customer.email && <div className="text-muted-foreground text-xs">{customer.email}</div>}
                      </TableCell>
                      <TableCell className="font-mono">
                        NPR {(customer.creditBalance || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {(customer.creditBalance || 0) > 0 ? (
                          <Badge variant="destructive">Has Credit</Badge>
                        ) : (
                          <Badge variant="secondary">No Balance</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
