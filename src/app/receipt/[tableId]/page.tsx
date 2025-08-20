
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

export default function ReceiptPage() {
  const { tableId: tableIdParam } = useParams();
  const tableId = Number(tableIdParam);
  const searchParams = useSearchParams();
  const { settings, kitchenOrders, isLoaded } = useApp();
  const [invoiceId, setInvoiceId] = useState('');

  useEffect(() => {
    // Generate a random 6-digit invoice ID
    setInvoiceId(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
  }, []);

  const paymentMethod = searchParams.get('method') || 'N/A';
  const transactionDate = new Date().toLocaleString();

  const ordersForTable = useMemo(() => {
    return kitchenOrders.filter(o => o.tableId === tableId && (o.status === 'completed' || o.status === 'paid'));
  }, [kitchenOrders, tableId]);

  const billDetails = useMemo(() => {
    const subtotal = ordersForTable.reduce((acc, order) => acc + order.total, 0);
    const vat = subtotal * 0.13;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }, [ordersForTable]);

  if (!isLoaded) {
    return <div>Loading receipt...</div>;
  }
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="bg-muted min-h-screen p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-2xl bg-background shadow-lg print:shadow-none">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">{settings.cafeName}</CardTitle>
            <CardDescription>{settings.address} | {settings.phone}</CardDescription>
            <div className="pt-4">
              <h2 className="text-2xl font-bold font-headline">INVOICE</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" placeholder="Enter customer name" className="print:border-none print:pl-0" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="customerAddress">Customer Address</Label>
                    <Input id="customerAddress" placeholder="Enter customer address" className="print:border-none print:pl-0" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customerPhone">Customer Phone</Label>
                    <Input id="customerPhone" placeholder="Enter phone number" className="print:border-none print:pl-0" />
                </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 text-sm">
                <div>
                    <p><span className="font-semibold">Invoice #:</span> {invoiceId}</p>
                    <p><span className="font-semibold">Invoice For:</span> Table {tableId}</p>
                    <p><span className="font-semibold">Date:</span> {transactionDate}</p>
                </div>
                 <div className="text-right">
                    <p><span className="font-semibold">Payment Method:</span> <span className="capitalize">{paymentMethod}</span></p>
                </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg font-headline">Order Summary</h3>
              <div className="border rounded-lg">
                <div className="grid grid-cols-4 font-semibold border-b p-2 bg-muted/50">
                    <div className="col-span-2">Item</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Amount</div>
                </div>
                 <div className="p-2 space-y-2">
                    {ordersForTable.flatMap(order => order.items).map(item => (
                        <div key={item.id} className="grid grid-cols-4 text-sm">
                            <div className="col-span-2">{item.name}</div>
                            <div className="text-center">x{item.quantity}</div>
                            <div className="text-right">NPR {(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                    <Separator />
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">NPR {billDetails.subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>VAT (13%)</span>
                        <span className="font-medium">NPR {billDetails.vat.toFixed(2)}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between text-lg font-bold text-primary">
                        <span>Total Due</span>
                        <span>NPR {billDetails.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
             <div className="text-center text-xs text-muted-foreground pt-4">
                Thank you for your visit!
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end p-4 print:hidden">
            <Button onClick={handlePrint}>
                <Printer />
                Print Receipt
            </Button>
        </div>
      </div>
      <style jsx global>{`
        @media print {
            body {
                background-color: #fff;
            }
        }
      `}</style>
    </div>
  );
}
