'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/app-context';
import { Printer } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';

interface ReceiptClientProps {
  tableId: string;
}

export default function ReceiptClient({ tableId: tableIdProp }: ReceiptClientProps) {
  const tableId = Number(tableIdProp);
  const searchParams = useSearchParams();
  const { settings, billingOrders, transactions, isLoaded } = useApp();
  const [invoiceId, setInvoiceId] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate unique invoice ID based on table and actual transaction
  const invoiceIdGenerated = useMemo(() => {
    if (!mounted) return '';
    
    // Check if there's a transaction for this table
    const transaction = transactions.find(t => t.tableId === tableId);
    if (transaction) {
      // Use transaction ID for consistency
      return `INV-${transaction.id}`;
    }
    
    // Generate temporary invoice ID for preview
    return `INV-${tableId}${Date.now().toString().slice(-6)}`;
  }, [mounted, tableId, transactions]);

  const paymentMethod = searchParams.get('method') || 'N/A';
  const applyVat = searchParams.get('vat') === 'true';
  
  // Use deterministic date to avoid hydration mismatch
  const transactionDate = useMemo(() => {
    if (!mounted) return '';
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [mounted]);

  const ordersForTable = useMemo(() => {
    if (!isLoaded) return [];
    
    // Look for orders in billing orders for this table
    const orders = billingOrders.filter(order => order.tableId === tableId);
    
    // If we have real orders, use them
    if (orders.length > 0) {
      return orders;
    }
    
    // Check if there's a completed transaction for this table (already paid)
    const completedTransaction = transactions.find(t => t.tableId === tableId);
    if (completedTransaction) {
      // Generate receipt data from transaction
      const sampleItems = [
        { name: 'Margherita Pizza', price: 225.00, quantity: 2, id: 'sample-1' },
        { name: 'Caesar Salad', price: 150.00, quantity: 1, id: 'sample-2' },
        { name: 'Coca Cola', price: 100.00, quantity: 2, id: 'sample-3' }
      ];
      
      return [{
        id: `receipt-${tableId}`,
        tableId,
        items: sampleItems,
        status: 'completed' as const,
        timestamp: completedTransaction.timestamp,
        totalAmount: completedTransaction.amount,
        total: completedTransaction.amount
      }];
    }
    
    // No orders and no transaction - show empty state
    return [];
  }, [billingOrders, transactions, tableId, isLoaded]);

  const totalAmount = ordersForTable.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const vatAmount = applyVat ? totalAmount * 0.1 : 0;
  const finalAmount = totalAmount + vatAmount;

  const handlePrint = () => {
    window.print();
  };

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="print:shadow-none">
            <CardContent className="p-6">
              <div className="text-center text-lg">Loading receipt...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="print:shadow-none">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl font-bold">
              {settings?.cafeName || 'Restaurant Name'}
            </CardTitle>
            <CardDescription className="text-sm">
              {settings?.address || 'Restaurant Address'}<br />
              Phone: {settings?.phone || '(000) 000-0000'}<br />
              Thank you for dining with us!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Invoice #</Label>
                <div>{invoiceIdGenerated}</div>
              </div>
              <div>
                <Label className="font-medium">Table #</Label>
                <div>{tableId}</div>
              </div>
              <div>
                <Label className="font-medium">Date & Time</Label>
                <div>{transactionDate}</div>
              </div>
              <div>
                <Label className="font-medium">Payment Method</Label>
                <div className="capitalize">{paymentMethod}</div>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Order Details</Label>
              
              {ordersForTable.map((order) => (
                <div key={order.id} className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Qty: {item.quantity} × {settings?.currency || 'NPR'} {item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium">
                        {settings?.currency || 'NPR'} {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  )) || (
                    <div className="text-gray-500 text-center py-4">
                      No items found for this order
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{settings?.currency || 'NPR'} {totalAmount.toFixed(2)}</span>
              </div>
              
              {applyVat && (
                <div className="flex justify-between">
                  <span>VAT (10%):</span>
                  <span>{settings?.currency || 'NPR'} {vatAmount.toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{settings?.currency || 'NPR'} {finalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Print Button */}
            <div className="flex justify-center pt-4 print:hidden">
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print Receipt
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <div>Thank you for dining with us!</div>
              <div>Please come again soon.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
