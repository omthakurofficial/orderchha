
'use client';

import React from 'react';
import { useApp } from '@/context/app-context';
import { useNotifications } from '@/context/notification-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderSummaryContent() {
  const { order, updateOrderItemQuantity, removeItemFromOrder, placeOrder, settings, getTableOrder, currentTableId, setCurrentTableId } = useApp();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  const tableNumber = tableId ? parseInt(tableId, 10) : null;

  // 🔥 Set current table and get table-specific order
  const actualOrder = tableNumber ? getTableOrder(tableNumber) : [];
  const total = actualOrder.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = actualOrder.reduce((acc, item) => acc + item.quantity, 0);

  // Update current table when table changes
  React.useEffect(() => {
    if (tableNumber && currentTableId !== tableNumber) {
      setCurrentTableId(tableNumber);
    }
  }, [tableNumber, currentTableId, setCurrentTableId]);

  const handlePlaceOrder = () => {
    if (!tableNumber) {
      toast({
        variant: 'destructive',
        title: 'Table Number Missing',
        description: 'Could not place order. The table number is missing from the URL.',
      });
      return;
    }
    
    if (actualOrder.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty Cart',
        description: `No items in cart for Table ${tableNumber}`,
      });
      return;
    }
    
    placeOrder(tableNumber);
    
    // Add notification for order placed
    addNotification({
      title: 'New Order Placed',
      message: `Table ${tableNumber} placed an order with ${itemCount} items (₹${total.toFixed(2)})`,
      type: 'order_placed',
      priority: 'medium',
      tableId: tableNumber,
    });
    
    toast({
      title: 'Order Submitted! 🍽️',
      description: `Table ${tableNumber} order with ${itemCount} items submitted for confirmation.`,
    });
  };

  if (order.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">Your order is empty</h3>
        <p className="text-sm text-muted-foreground">Add items from the menu to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky footer to ensure it's always visible */}
      <div className="sticky bottom-0 z-10 bg-card p-4 border-t shadow-md">
        <div className="flex justify-between text-lg font-bold text-primary mb-2">
          <span>Total</span>
          <span>{settings?.currency || 'NPR'} {total.toFixed(2)}</span>
        </div>
        <Button className="w-full mt-2" size="lg" onClick={handlePlaceOrder} disabled={!tableNumber || actualOrder.length === 0}>
          Submit Order for Confirmation
        </Button>
      </div>
      
      <ScrollArea className="flex-1 max-h-[calc(100vh-220px)]">
        <div className="p-4 space-y-4">
          {actualOrder.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No items in cart</p>
              {tableNumber && <p className="text-sm">Start adding items for Table {tableNumber}</p>}
            </div>
          ) : (
            actualOrder.map(item => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-2 last:border-b-0">
                <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-primary font-medium">{settings?.currency || 'NPR'} {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => tableNumber && updateOrderItemQuantity(item.id, item.quantity - 1, tableNumber)}
                  >
                    <MinusCircle className="w-4 h-4" />
                  </Button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => tableNumber && updateOrderItemQuantity(item.id, item.quantity + 1, tableNumber)}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive" 
                    onClick={() => tableNumber && removeItemFromOrder(item.id, tableNumber)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="p-2 text-xs text-muted-foreground text-center">
        Prices are inclusive of VAT where applicable.
      </div>
    </div>
  );
}


export function OrderSummary() {
  return (
    <Suspense fallback={<div>Loading order...</div>}>
      <OrderSummaryContent />
    </Suspense>
  )
}
