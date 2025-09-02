'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/app-context';
import { db } from '@/lib/supabase';
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
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [showConsolidated, setShowConsolidated] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load completed orders if no billing orders exist
  useEffect(() => {
    const loadCompletedOrders = async () => {
      if (!mounted || !isLoaded) return;
      
      // If there are billing orders, don't load completed ones
      const hasBillingOrders = billingOrders.some(order => order.tableId === tableId);
      if (hasBillingOrders) return;
      
      // Load completed orders from database
      try {
        const completedOrdersData = await db.getCompletedOrdersByTable(tableId);
        if (completedOrdersData && completedOrdersData.length > 0) {
          const formattedOrders = completedOrdersData.map((order: any) => ({
            id: order.id,
            tableId: order.table_id,
            items: order.order_items?.map((item: any) => {
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
            status: order.status,
            timestamp: order.created_at,
            totalAmount: order.total_amount,
            total: order.total_amount
          }));
          setCompletedOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Error loading completed orders:', error);
      }
    };

    loadCompletedOrders();
  }, [mounted, isLoaded, tableId, billingOrders]);

  const ordersForTable = useMemo(() => {
    if (!isLoaded) return [];
    
    // Look for orders in billing orders for this table (not yet paid)
    const billingOrdersForTable = billingOrders.filter(order => order.tableId === tableId);
    
    // If we have real billing orders, use them
    if (billingOrdersForTable.length > 0) {
      return billingOrdersForTable;
    }
    
    // If no billing orders, check completed orders (already paid)
    if (completedOrders.length > 0) {
      return completedOrders;
    }
    
    // No real data found - show empty state instead of mock data
    return [];
  }, [billingOrders, completedOrders, tableId, isLoaded]);

  const invoiceIdGenerated = useMemo(() => {
    if (!mounted) return `INV-${tableId}-loading`;
    
    // Check if there's a transaction for this table
    const transaction = transactions.find(t => t.tableId === tableId);
    if (transaction) {
      // Use transaction ID for consistency - extract just the first 8 chars
      return `INV-${transaction.id.substring(0, 8).toUpperCase()}`;
    }
    
    // Use the most recent order's created_at date for deterministic invoice ID
    if (ordersForTable.length > 0) {
      const mostRecentOrder = ordersForTable[0];
      if (mostRecentOrder.timestamp) {
        const orderDate = new Date(mostRecentOrder.timestamp);
        const year = orderDate.getFullYear();
        const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
        const day = orderDate.getDate().toString().padStart(2, '0');
        return `INV-${tableId}-${year}${month}${day}`;
      }
    }
    
    // Fallback deterministic ID
    return `INV-T${tableId}-${tableId.toString().padStart(3, '0')}`;
  }, [mounted, tableId, transactions, ordersForTable]);

  const paymentMethod = searchParams.get('method') || 'N/A';
  const applyVat = searchParams.get('vat') === 'true';
  
  // Use order timestamp for deterministic date to avoid hydration mismatch
  const transactionDate = useMemo(() => {
    if (!mounted) return 'Loading...';
    
    // Use the transaction date if available
    const transaction = transactions.find(t => t.tableId === tableId);
    if (transaction && transaction.timestamp) {
      return new Date(transaction.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Use the most recent order date
    if (ordersForTable.length > 0 && ordersForTable[0].timestamp) {
      return new Date(ordersForTable[0].timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Fallback to current date only if no order data
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [mounted]);

  // Consolidate items from multiple orders for cleaner display
  const consolidatedItems = useMemo(() => {
    const itemMap = new Map();
    
    ordersForTable.forEach(order => {
      order.items?.forEach((item: any) => {
        const key = `${item.name}-${item.price}`;
        if (itemMap.has(key)) {
          const existingItem = itemMap.get(key);
          existingItem.quantity += item.quantity;
          existingItem.totalPrice = existingItem.quantity * existingItem.price;
        } else {
          itemMap.set(key, {
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity
          });
        }
      });
    });
    
    return Array.from(itemMap.values());
  }, [ordersForTable]);

  const totalAmount = ordersForTable.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const vatAmount = applyVat ? totalAmount * 0.1 : 0;
  const finalAmount = totalAmount + vatAmount;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Prevent hydration mismatch by not rendering dynamic content until mounted
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

  // Show message when no order data is found
  if (!isLoaded || ordersForTable.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="print:shadow-none">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
                <p className="text-muted-foreground">No orders found for Table {tableId}.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Orders may not have been placed yet or have already been processed.
                </p>
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
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Order Details</Label>
                {ordersForTable.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowConsolidated(!showConsolidated)}
                    className="print:hidden text-xs"
                  >
                    {showConsolidated ? 'Show Details' : 'Consolidate'}
                  </Button>
                )}
              </div>
              
              {ordersForTable.length > 1 && !showConsolidated && (
                <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  ℹ️ This receipt shows {ordersForTable.length} separate orders for this table
                </div>
              )}
              
              {showConsolidated ? (
                /* Consolidated View */
                <div className="space-y-2">
                  {consolidatedItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Qty: {item.quantity} × {settings?.currency || 'NPR'} {item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium">
                        {settings?.currency || 'NPR'} {item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {ordersForTable.length > 1 && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Combined from {ordersForTable.length} orders
                    </div>
                  )}
                </div>
              ) : (
                /* Detailed View */
                <div className="space-y-4">
                  {ordersForTable.map((order, orderIndex) => (
                    <div key={order.id} className="space-y-2">
                      {ordersForTable.length > 1 && (
                        <div className="text-sm font-medium text-gray-700 border-b pb-1">
                          Order #{orderIndex + 1} (ID: {order.id.substring(0, 8)})
                        </div>
                      )}
                      {order.items?.map((item: any, index: number) => (
                        <div key={`${order.id}-${index}`} className="flex justify-between items-center py-1">
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
              )}
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
