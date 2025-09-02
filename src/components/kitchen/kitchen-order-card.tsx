
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
import type { KitchenOrder } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle } from "lucide-react";

interface KitchenOrderCardProps {
    order: KitchenOrder;
}

export function KitchenOrderCard({ order }: KitchenOrderCardProps) {
    const { updateOrderStatus, settings } = useApp();
    const { toast } = useToast();

    const handleMarkReady = () => {
        updateOrderStatus(order.id, 'ready');
        toast({
            title: "Order Ready",
            description: `Order for Table ${order.tableId} is ready for pickup.`,
        });
    };

    const handleMarkCompleted = () => {
        updateOrderStatus(order.id, 'completed');
        toast({
            title: "Order Completed",
            description: `Order for Table ${order.tableId} has been delivered.`,
        });
    };

    const timeAgo = formatDistanceToNow(new Date(order.timestamp), { addSuffix: true });

    return (
        <Card className="flex flex-col h-full bg-background shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Table {order.tableId}</CardTitle>
                <CardDescription>Order placed {timeAgo}</CardDescription>
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
                            <span className="text-primary font-bold">{settings?.currency || 'NPR'} {(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <Separator />
                 <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Total</span>
                    <span>{settings?.currency || 'NPR'} {order.totalAmount.toFixed(2)}</span>
                </div>

            </CardContent>
            <CardFooter className="flex gap-2">
                {order.status === 'preparing' && (
                    <Button className="flex-1" size="lg" onClick={handleMarkReady}>
                        <CheckCircle />
                        Mark as Ready
                    </Button>
                )}
                {order.status === 'ready' && (
                    <Button className="flex-1" size="lg" onClick={handleMarkCompleted}>
                        <CheckCircle />
                        Mark as Delivered
                    </Button>
                )}
                {order.status === 'completed' && (
                    <div className="w-full text-center text-green-600 font-semibold">
                        ✅ Order Completed
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
