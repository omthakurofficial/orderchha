
'use client';

import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function OrderSummary() {
  const { order, updateOrderItemQuantity, removeItemFromOrder, clearOrder } = useApp();
  const { toast } = useToast();

  const total = order.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    toast({
        title: "Order Placed!",
        description: "Your order has been sent to the kitchen.",
    });
    clearOrder();
  }

  if (order.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Your order is empty</h3>
            <p className="text-sm text-muted-foreground">Add items from the menu to get started.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {order.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-primary font-medium">NPR {item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateOrderItemQuantity(item.id, item.quantity - 1)}>
                  <MinusCircle className="w-4 h-4" />
                </Button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateOrderItemQuantity(item.id, item.quantity + 1)}>
                  <PlusCircle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItemFromOrder(item.id)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t mt-auto space-y-3">
        <div className="flex justify-between font-semibold">
          <span>Subtotal</span>
          <span>NPR {total.toFixed(2)}</span>
        </div>
         <div className="flex justify-between text-sm text-muted-foreground">
          <span>VAT (13%)</span>
          <span>NPR {(total * 0.13).toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold text-primary">
          <span>Total</span>
          <span>NPR {(total * 1.13).toFixed(2)}</span>
        </div>
        <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
          Place Order
        </Button>
      </div>
    </div>
  );
}
