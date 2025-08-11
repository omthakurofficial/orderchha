
import type { MenuItem } from "@/types";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { settings, addItemToOrder } = useApp();
  const { toast } = useToast();

  const isOrderable = item.inStock && settings.onlineOrderingEnabled;

  const handleAddItem = () => {
    addItemToOrder(item);
    toast({
      title: "Added to Order",
      description: `${item.name} has been added to your order.`,
    })
  }

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="p-0 relative">
        <Image
          src={item.image}
          alt={item.name}
          width={600}
          height={400}
          data-ai-hint={item.imageHint}
          className="object-cover w-full h-40"
        />
        <Badge 
          className={cn(
            "absolute top-2 right-2",
            item.inStock 
              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800" 
              : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800"
          )}
        >
          {item.inStock ? "In Stock" : "Out of Stock"}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-lg mb-1">{item.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">NPR {item.price.toFixed(2)}</p>
        <Button 
          disabled={!isOrderable} 
          onClick={handleAddItem}
          title={!settings.onlineOrderingEnabled ? "Online ordering is currently disabled" : !item.inStock ? "This item is out of stock" : "Add to order"}
        >
          <PlusCircle />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
