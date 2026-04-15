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
import { CreditCard, Banknote, Smartphone, QrCode, Receipt } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/supabase';

interface IndividualPaymentDialogProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export function IndividualPaymentDialog({ 
  order, 
  isOpen, 
  onClose, 
  onPaymentComplete 
}: IndividualPaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | 'card' | 'qr'>('cash');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const { settings, processIndividualOrderPayment } = useApp();
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

  const handleIndividualPayment = async () => {
    if (!order) return;

    if (!customerName.trim() || !customerMobile.trim() || !customerAddress.trim()) {
      toast({
        title: 'Customer Profile Required',
        description: 'Name, mobile, and address are required before payment.',
        variant: 'destructive',
      });
      return;
    }

    if (redeemPoints < 0 || redeemPoints > loyaltyBalance) {
      toast({
        title: 'Invalid Redeem Points',
        description: 'Redeem points cannot exceed current points balance.',
        variant: 'destructive',
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      const result = await processIndividualOrderPayment(
        order.id,
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
      
      if (result?.success) {
        addNotification({
          title: 'Individual Order Completed',
          message: `Order ${order.id.substring(0, 8)} payment completed (${formatCurrency(order.totalAmount || 0, settings.currency)})`,
          type: 'order_completed',
          priority: 'low',
          tableId: order.tableId,
        });

        setPaymentSuccess(true);
        onPaymentComplete();
      }
      
    } catch (error) {
      console.error('Error processing individual payment:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing the payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Individual Payment</DialogTitle>
          <DialogDescription>
            Process payment for Order #{order.id.substring(0, 8)} - Table {order.tableId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {paymentSuccess ? (
            /* Payment Success State */
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Receipt className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Order #{order.id.substring(0, 8)} has been processed successfully
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/receipt/order/${order.id}`}>
                    <Receipt className="h-4 w-4 mr-2" />
                    View Receipt
                  </Link>
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Order Total:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(order.totalAmount || 0, settings.currency)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <h4 className="font-medium mb-3">Select Payment Method</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'} 
                    onClick={() => setPaymentMethod('cash')}
                    className="flex items-center gap-2"
                  >
                    <Banknote className="h-4 w-4" />
                    Cash
                  </Button>
                  <Button 
                    variant={paymentMethod === 'card' ? 'default' : 'outline'} 
                    onClick={() => setPaymentMethod('card')}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Card
                  </Button>
                  <Button 
                    variant={paymentMethod === 'online' ? 'default' : 'outline'} 
                    onClick={() => setPaymentMethod('online')}
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Online
                  </Button>
                  <Button 
                    variant={paymentMethod === 'qr' ? 'default' : 'outline'} 
                    onClick={() => setPaymentMethod('qr')}
                    className="flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
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

                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between text-sm">
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
                      Discount conversion follows admin loyalty settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1" disabled={processing}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleIndividualPayment} 
                  className="flex-1"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Complete ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Payment`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
