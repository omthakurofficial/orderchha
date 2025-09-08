
import type { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/currency";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { settings, addItemToOrder } = useApp();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');

  const isOrderable = item.inStock && settings.onlineOrderingEnabled && !!tableId;

  const handleAddItem = () => {
    if (!tableId) {
      toast({
        title: "No Table Selected",
        description: "Please select a table to start an order.",
        variant: "destructive"
      });
      return;
    }
    
    const tableNumber = parseInt(tableId);
    addItemToOrder(item, tableNumber);
    toast({
      title: `Added to Table ${tableNumber}`,
      description: `${item.name} added to Table ${tableNumber} order.`,
    });
  };
  
  const getDisabledTooltip = () => {
    if (!tableId) return "Please select a table to start an order.";
    if (!settings.onlineOrderingEnabled) return "Online ordering is currently disabled";
    if (!item.inStock) return "This item is out of stock";
    return "Add to order";
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
        <p className="text-lg font-bold text-primary price-tag">{formatCurrency(item.price, settings?.currency)}</p>
        <Button 
          disabled={!isOrderable} 
          onClick={handleAddItem}
          title={getDisabledTooltip()}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4"
          style={{ backgroundColor: '#1E88E5', borderRadius: '50px' }}
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
