'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

const creditFormSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  customerId: z.string().min(1, 'Customer is required'),
  notes: z.string().optional(),
});

type CreditFormValues = z.infer<typeof creditFormSchema>;

interface PaymentDialogProps {
  tableId: number;
  amount: number;
  onPaymentComplete: () => void;
}

export function PaymentDialog({ tableId, amount, onPaymentComplete }: PaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | 'credit' | 'card' | 'qr'>('cash');
  const { users, completeTransaction } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const customers = users.filter(user => user.isCustomer || user.role === 'admin');
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const form = useForm<CreditFormValues>({
    resolver: zodResolver(creditFormSchema),
    defaultValues: {
      amount,
      customerId: '',
      notes: '',
    },
  });

  const handlePayment = async () => {
    try {
      await completeTransaction({
        id: `tr-${Date.now()}`,
        tableId,
        amount,
        method: paymentMethod,
        timestamp: new Date().toISOString(),
      });
      
      toast({
        title: '✅ Payment Processed',
        description: `Payment for Table ${tableId} completed successfully.`,
      });
      
      onPaymentComplete();
      setOpen(false);
    } catch (error) {
      toast({
        title: '❌ Payment Failed',
        description: 'There was an error processing the payment.',
        variant: 'destructive',
      });
    }
  };

  const handleCreditSubmit = (data: CreditFormValues) => {
    const customer = customers.find(c => c.uid === data.customerId);
    
    completeTransaction({
      id: `tr-${Date.now()}`,
      tableId,
      amount,
      method: 'credit',
      timestamp: new Date().toISOString(),
      customerId: data.customerId,
      customerName: customer?.name,
      notes: data.notes || `Credit for ${customer?.name}`
    });
    
    toast({
      title: '✅ Credit Added',
      description: `Credit for ${customer?.name} has been recorded.`,
    });
    
    onPaymentComplete();
    setOpen(false);
  };

  const openDialog = () => {
    console.log("Opening payment dialog");
    setOpen(true);
  };

  return (
    <>
      {/* Use a regular button with a clear onClick handler */}
      <Button 
        className="w-full" 
        onClick={openDialog}
        variant="default"
      >
        Process Payment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Select payment method for Table {tableId} - {amount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={paymentMethod === 'cash' ? 'default' : 'outline'} 
              onClick={() => setPaymentMethod('cash')}
            >
              Cash
            </Button>
            <Button 
              variant={paymentMethod === 'card' ? 'default' : 'outline'} 
              onClick={() => setPaymentMethod('card')}
            >
              Card
            </Button>
            <Button 
              variant={paymentMethod === 'online' ? 'default' : 'outline'} 
              onClick={() => setPaymentMethod('online')}
            >
              Online Banking
            </Button>
            <Button 
              variant={paymentMethod === 'qr' ? 'default' : 'outline'} 
              onClick={() => setPaymentMethod('qr')}
            >
              QR Payment
            </Button>
            <Button 
              variant={paymentMethod === 'credit' ? 'default' : 'outline'} 
              onClick={() => setPaymentMethod('credit')}
              className="col-span-2"
            >
              Customer Credit
            </Button>
          </div>

          {paymentMethod === 'credit' ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreditSubmit)} className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Select Customer</Label>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCustomers.map(customer => (
                            <SelectItem key={customer.uid} value={customer.uid}>
                              {customer.name} {customer.creditBalance ? `(Balance: ${customer.creditBalance})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Notes (optional)</Label>
                      <FormControl>
                        <Input placeholder="Add notes about this credit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Add to Customer Credit
                </Button>
              </form>
            </Form>
          ) : (
            <Button onClick={handlePayment} className="w-full">
              Complete {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
