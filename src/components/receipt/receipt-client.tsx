'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/app-context-supabase';
import { Printer } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';

interface ReceiptClientProps {
  tableId: string;
}

export default function ReceiptClient({ tableId: tableIdProp }: ReceiptClientProps) {
  const tableId = Number(tableIdProp);
  const searchParams = useSearchParams();
  const { settings, kitchenOrders, isLoaded } = useApp();
  const [invoiceId, setInvoiceId] = useState('');

  useEffect(() => {
    // Generate a random 6-digit invoice ID
    setInvoiceId(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
  }, []);

  const paymentMethod = searchParams.get('method') || 'N/A';
  const applyVat = searchParams.get('vat') === 'true';
  const transactionDate = new Date().toLocaleString();

  const ordersForTable = useMemo(() => {
    if (!isLoaded) return [];
    
    const orders = kitchenOrders.filter(order => order.tableId === tableId);
    
    if (orders.length === 0) {
      // Generate sample data if no orders exist
      return [{
        id: `sample-${tableId}`,
        tableId,
        items: [
          { name: 'Margherita Pizza', price: 12.99, quantity: 2 },
          { name: 'Caesar Salad', price: 8.50, quantity: 1 },
          { name: 'Coca Cola', price: 2.50, quantity: 2 }
        ],
        status: 'completed' as const,
        createdAt: new Date(),
        total: 37.48
      }];
    }
    
    return orders;
  }, [kitchenOrders, tableId, isLoaded]);

  const totalAmount = ordersForTable.reduce((sum, order) => sum + (order.total || 0), 0);
  const vatAmount = applyVat ? totalAmount * 0.1 : 0;
  const finalAmount = totalAmount + vatAmount;

  const handlePrint = () => {
    window.print();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading receipt...</div>
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
                <div>{invoiceId}</div>
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
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
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
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              
              {applyVat && (
                <div className="flex justify-between">
                  <span>VAT (10%):</span>
                  <span>${vatAmount.toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${finalAmount.toFixed(2)}</span>
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
