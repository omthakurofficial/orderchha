'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/app-context';
import { db } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Printer, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';

interface IndividualReceiptClientProps {
  orderId: string;
}

export default function IndividualReceiptClient({ orderId }: IndividualReceiptClientProps) {
  const router = useRouter();
  const { settings, transactions, isLoaded } = useApp();
  const [mounted, setMounted] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load specific order data
  useEffect(() => {
    const loadOrderData = async () => {
      if (!mounted || !isLoaded) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get the specific order by ID
        const foundOrder = await db.getOrderById(orderId);
        
        if (foundOrder) {
          // Format the order data
          const formattedOrder = {
            id: foundOrder.id,
            tableId: foundOrder.table_id,
            items: foundOrder.order_items?.map((item: any) => {
              const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
              return {
                id: item.menu_item_id,
                name: menuItem?.name || 'Unknown Item',
                description: menuItem?.description || '',
                price: item.price,
                quantity: item.quantity,
                image: menuItem?.image_url || '',
                inStock: true
              };
            }) || [],
            status: foundOrder.status,
            timestamp: foundOrder.created_at,
            totalAmount: foundOrder.total_amount,
            total: foundOrder.total_amount,
            customerName: foundOrder.customer_name,
            phone: foundOrder.phone,
            notes: foundOrder.notes
          };
          
          setOrderData(formattedOrder);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error loading order data:', err);
        setError('Failed to load order data');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [mounted, isLoaded, orderId]);

  // Find transaction for this specific order
  const orderTransaction = useMemo(() => {
    // First try to find transaction by order ID (most accurate)
    const transactionByOrderId = transactions.find(t => t.orderId === orderId);
    if (transactionByOrderId) {
      return transactionByOrderId;
    }
    
    // Fallback: find by table ID only if no order-specific transaction found
    if (orderData) {
      return transactions.find(t => t.tableId === orderData.tableId);
    }
    
    return null;
  }, [transactions, orderId, orderData]);

  const invoiceIdGenerated = useMemo(() => {
    if (!mounted) return `INV-loading`;
    
    // Generate based on order ID
    return `INV-${orderId.substring(0, 8).toUpperCase()}`;
  }, [mounted, orderId]);

  const transactionDate = useMemo(() => {
    if (!mounted) return 'Loading...';
    
    // Use transaction timestamp if available
    if (orderTransaction?.timestamp) {
      return new Date(orderTransaction.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Use order timestamp
    if (orderData?.timestamp) {
      return new Date(orderData.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [mounted, orderTransaction, orderData]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="print:shadow-none">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-pulse mb-4">Loading order details...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="print:shadow-none">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground">
                  Order ID: {orderId} could not be found.
                </p>
                <Button 
                  onClick={() => router.back()} 
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
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
              {settings?.cafeName || 'Sips & Slices Corner'}
            </CardTitle>
            <CardDescription className="text-sm">
              {settings?.address || '123 Gourmet Street, Foodie City, 98765'}<br />
              Phone: {settings?.phone || '(555) 123-4567'}<br />
              Thank you for dining with us!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Navigation */}
            <div className="print:hidden">
              <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Billing
              </Button>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Invoice #</Label>
                <div>{invoiceIdGenerated}</div>
              </div>
              <div>
                <Label className="font-medium">Table #</Label>
                <div>{orderData.tableId}</div>
              </div>
              <div>
                <Label className="font-medium">Order ID</Label>
                <div className="font-mono text-xs">{orderId.substring(0, 8)}</div>
              </div>
              <div>
                <Label className="font-medium">Date & Time</Label>
                <div>{transactionDate}</div>
              </div>
              {orderData.customerName && (
                <div>
                  <Label className="font-medium">Customer</Label>
                  <div>{orderData.customerName}</div>
                </div>
              )}
              <div>
                <Label className="font-medium">Payment Method</Label>
                <div className="capitalize">{orderTransaction?.method || 'Cash'}</div>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Order Details</Label>
                <div className="text-sm text-muted-foreground">
                  Individual Order Receipt
                </div>
              </div>
              
              <div className="space-y-2">
                {orderData.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
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

              {orderData.notes && (
                <div className="text-sm text-muted-foreground">
                  <strong>Notes:</strong> {orderData.notes}
                </div>
              )}
            </div>

            <Separator />

            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{settings?.currency || 'NPR'} {(orderData.totalAmount || 0).toFixed(2)}</span>
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
              <div className="text-xs mt-2">
                Order ID: {orderId} • {orderData.status === 'completed' ? 'Paid' : 'Pending Payment'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
