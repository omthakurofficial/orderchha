
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/app-context-supabase";
import { useToast } from "@/hooks/use-toast";
import type { KitchenOrder } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle } from "lucide-react";

interface KitchenOrderCardProps {
    order: KitchenOrder;
}

export function KitchenOrderCard({ order }: KitchenOrderCardProps) {
    const { completeKitchenOrder } = useApp();
    const { toast } = useToast();

    const handleCompleteOrder = () => {
        completeKitchenOrder(order.id);
        toast({
            title: "Order Completed",
            description: `Order for Table ${order.tableId} has been marked as complete.`,
        });
    }

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
            <CardFooter>
                <Button className="w-full" size="lg" onClick={handleCompleteOrder}>
                    <CheckCircle />
                    Mark as Completed
                </Button>
            </CardFooter>
        </Card>
    );
}
