
'use client';

import React from 'react';
import { useApp } from '@/context/app-context';
import { useNotifications } from '@/context/notification-context';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderSummaryContent() {
  const { updateOrderItemQuantity, removeItemFromOrder, placeOrder, settings, getTableOrder, currentTableId, setCurrentTableId, currentUser } = useApp();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  const mode = searchParams.get('mode') === 'direct' ? 'direct' : 'table';
  const tableNumber = tableId ? parseInt(tableId, 10) : null;
  const isAdmin = currentUser?.role === 'admin';
  const effectiveMode = mode === 'direct' || (isAdmin && !tableNumber) ? 'direct' : 'table';
  const cartTableId = effectiveMode === 'direct' ? 0 : tableNumber;
  const activeCartTableId = cartTableId ?? 0;

  // 🔥 Set current table and get table-specific order
  const actualOrder = effectiveMode === 'direct' ? getTableOrder(0) : (tableNumber ? getTableOrder(tableNumber) : []);
  const total = actualOrder.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = actualOrder.reduce((acc, item) => acc + item.quantity, 0);

  // Update current table when table changes
  React.useEffect(() => {
    if (effectiveMode === 'direct') {
      if (currentTableId !== 0) {
        setCurrentTableId(0);
      }
    } else if (tableNumber && currentTableId !== tableNumber) {
      setCurrentTableId(tableNumber);
    } else if (!tableNumber && currentTableId !== null) {
      setCurrentTableId(null);
    }
  }, [effectiveMode, tableNumber, currentTableId, setCurrentTableId]);

  const handlePlaceOrder = () => {
    if (effectiveMode !== 'direct' && !tableNumber) {
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
        description: effectiveMode === 'direct'
          ? 'No items in the Direct Order cart.'
          : `No items in cart for Table ${tableNumber}`,
      });
      return;
    }
    
    placeOrder(activeCartTableId);
    
    // Add notification for order placed
    addNotification({
      title: 'New Order Placed',
      message: effectiveMode === 'direct'
        ? `Direct order placed with ${itemCount} items (${formatCurrency(total, settings.currency)})`
        : `Table ${tableNumber} placed an order with ${itemCount} items (${formatCurrency(total, settings.currency)})`,
      type: 'order_placed',
      priority: 'medium',
      tableId: activeCartTableId,
    });
    
    toast({
      title: 'Order Submitted! 🍽️',
      description: effectiveMode === 'direct'
        ? `Direct order with ${itemCount} items submitted for confirmation.`
        : `Table ${tableNumber} order with ${itemCount} items submitted for confirmation.`,
    });
  };

  if (actualOrder.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center sm:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 shadow-sm sm:h-14 sm:w-14">
          <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-700 sm:text-lg">No items yet</h3>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          {effectiveMode === 'direct' ? 'Select menu items to build the direct order.' : 'Select menu items to build the waiter order.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky bottom-0 z-10 border-t border-slate-200/80 bg-card/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {effectiveMode === 'direct' ? 'Direct order total' : 'Current total'}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{settings?.currency || 'NPR'} {total.toFixed(2)}</p>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-900 sm:px-3 sm:text-xs">
            {itemCount} items
          </span>
        </div>
        <Button 
          className="mt-3 h-11 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-sm text-white shadow-md hover:from-orange-600 hover:to-amber-500 sm:mt-4 sm:h-12" 
          size="default" 
          onClick={handlePlaceOrder} 
          disabled={actualOrder.length === 0 || (effectiveMode !== 'direct' && !tableNumber)}
        >
          {effectiveMode === 'direct' ? 'Submit Direct Order' : 'Submit Order to Kitchen'}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 max-h-[calc(100vh-160px)] sm:max-h-[calc(100vh-220px)]">
        <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
          {actualOrder.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-slate-500 sm:py-10">
              <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-slate-300 sm:h-10 sm:w-10" />
              <p className="text-sm font-medium sm:text-base">No items in cart</p>
              {effectiveMode === 'direct' ? (
                <p className="text-sm">Start adding items for the direct order</p>
              ) : tableNumber ? (
                <p className="text-sm">Start adding items for Table {tableNumber}</p>
              ) : null}
            </div>
          ) : (
            actualOrder.map(item => (
              <div key={item.id} className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sm:gap-3 sm:p-3">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  width={60} 
                  height={60} 
                  className="h-12 w-12 rounded-xl object-cover sm:h-14 sm:w-14"
                />
                <div className="flex-1">
                  <p className="line-clamp-1 text-xs font-semibold text-slate-900 sm:text-sm">
                    {item.name}
                  </p>
                  <p 
                    className="price-tag"
                    style={{
                      backgroundColor: '#FFF7ED',
                      color: '#9A3412',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      display: 'inline-block',
                      fontWeight: '600',
                      fontSize: '11px'
                    }}
                  >
                    {settings?.currency || 'NPR'} {item.price.toFixed(0)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-xl bg-slate-100 hover:bg-slate-200 sm:h-8 sm:w-8" 
                    onClick={() => updateOrderItemQuantity(item.id, item.quantity - 1, activeCartTableId)}
                  >
                    <MinusCircle className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-5 text-center text-xs font-bold text-slate-900 sm:w-6 sm:text-sm">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-xl bg-slate-100 hover:bg-slate-200 sm:h-8 sm:w-8" 
                    onClick={() => updateOrderItemQuantity(item.id, item.quantity + 1, activeCartTableId)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-xl text-destructive hover:bg-rose-50 sm:h-8 sm:w-8" 
                    onClick={() => removeItemFromOrder(item.id, activeCartTableId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="px-3 pb-2 pt-1 text-center text-[10px] text-muted-foreground sm:px-4 sm:pb-3">
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
