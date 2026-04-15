'use client';

import { useApp } from "@/context/app-context";
import { useNotifications } from "@/context/notification-context";
import { formatCurrency } from '@/lib/currency';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/supabase';

interface PaymentDialogProps {
  tableId: number;
  amount: number;
  onPaymentComplete: () => void;
}

export function PaymentDialog({ tableId, amount, onPaymentComplete }: PaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const { processPayment, settings } = useApp();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    const lookupLoyalty = async () => {
      if (!customerMobile || customerMobile.trim().length < 7) {
        setLoyaltyBalance(0);
        return;
      }

      try {
        const loyalty = await db.getCustomerLoyaltyByMobile(customerMobile);
        setLoyaltyBalance(Number(loyalty?.loyalty?.current_balance || 0));
      } catch {
        setLoyaltyBalance(0);
      }
    };

    void lookupLoyalty();
  }, [customerMobile]);

  const handlePayment = async () => {
    if (!customerName.trim() || !customerMobile.trim() || !customerAddress.trim()) {
      toast({
        variant: 'destructive',
        title: 'Customer Profile Required',
        description: 'Name, mobile, and address are required before payment.',
      });
      return;
    }

    if (redeemPoints < 0 || redeemPoints > loyaltyBalance) {
      toast({
        variant: 'destructive',
        title: 'Invalid Redeem Points',
        description: 'Redeem points cannot exceed current points balance.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await processPayment(
        tableId,
        paymentMethod,
        false,
        {
          name: customerName.trim(),
          mobile: customerMobile.trim(),
          address: customerAddress.trim(),
          email: customerEmail.trim() || undefined,
        },
        redeemPoints,
        'In-house'
      );
      
      toast({
        title: '✅ Payment Processed',
        description: `Payment for Table ${tableId} completed and loyalty updated.`,
      });
      
      addNotification({
        title: 'Order Completed',
        message: `Table ${tableId} payment completed (${formatCurrency(amount, settings.currency)})`,
        type: 'order_completed',
        priority: 'low',
        tableId,
      });
      
      onPaymentComplete();
      setOpen(false);
    } catch (error) {
      toast({
        title: '❌ Payment Failed',
        description: 'There was an error processing the payment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDialog = () => {
    console.log("Opening payment dialog");
    setOpen(true);
  };

  return (
    <>
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
          <div className="grid gap-3">
            <div className="space-y-1">
              <Label>Customer Name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" />
            </div>

            <div className="space-y-1">
              <Label>Mobile Number</Label>
              <Input value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} placeholder="98XXXXXXXX" />
            </div>

            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="City / Area" />
            </div>

            <div className="space-y-1">
              <Label>Email (optional)</Label>
              <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="name@example.com" />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Current Points</span>
                <span className="font-semibold">{loyaltyBalance.toFixed(2)}</span>
              </div>

              <div className="mt-2 space-y-1">
                <Label>Redeem Points (optional)</Label>
                <Input
                  type="number"
                  min={0}
                  max={loyaltyBalance}
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(Number(e.target.value || 0))}
                />
                <p className="text-xs text-muted-foreground">
                  Discount is calculated from admin loyalty ratio at payment time.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={paymentMethod === 'cash' ? 'default' : 'outline'} 
              onClick={() => setPaymentMethod('cash')}
            >
              Cash
            </Button>
            <Button 
              variant={paymentMethod === 'online' ? 'default' : 'outline'} 
              onClick={() => setPaymentMethod('online')}
              className="col-span-1"
            >
              Online Banking
            </Button>
          </div>

          <Button onClick={handlePayment} className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? 'Processing...'
              : `Complete ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Payment`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
