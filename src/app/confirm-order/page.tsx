
'use client';

import { useApp } from '@/context/app-context-supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ClipboardCheck, ThumbsDown, ThumbsUp } from 'lucide-react';

export default function ConfirmOrderPage() {
  const { pendingOrders, approvePendingOrder, rejectPendingOrder, isLoaded } = useApp();

  if (!isLoaded) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Loading pending orders...</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <ClipboardCheck />
            Confirm Customer Orders
        </h1>
        <p className="text-muted-foreground">Review and approve new orders before sending them to the kitchen.</p>
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/20">
        {pendingOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-lg bg-background">
            <ClipboardCheck className="w-24 h-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-muted-foreground">No Pending Orders</h2>
            <p className="text-muted-foreground">Waiting for new orders from customers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {pendingOrders.map(order => (
                <Card key={order.id} className="flex flex-col h-full bg-background shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Table {order.tableId}</CardTitle>
                        <CardDescription>Order placed by customer</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                        <Separator />
                        <ul className="space-y-2">
                            {order.items.map(item => (
                                <li key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <span className="font-semibold">{item.name}</span>
                                        <span className="text-muted-foreground font-bold ml-2">x{item.quantity}</span>
                                    </div>
                                    <span className="text-primary font-bold">NPR {(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold text-primary">
                            <span>Total</span>
                            <span>NPR {order.totalAmount.toFixed(2)}</span>
                        </div>

                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Button variant="destructive" onClick={() => rejectPendingOrder(order.id)}>
                            <ThumbsDown /> Reject
                        </Button>
                        <Button onClick={() => approvePendingOrder(order.id)}>
                            <ThumbsUp /> Approve
                        </Button>
                    </CardFooter>
                </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
