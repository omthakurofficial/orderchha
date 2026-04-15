
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
  const { settings, addItemToOrder, currentUser } = useApp();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  const mode = searchParams.get('mode') === 'direct' ? 'direct' : 'table';
  const isAdmin = currentUser?.role === 'admin';
  const effectiveMode = mode === 'direct' || (isAdmin && !tableId) ? 'direct' : 'table';
  const canAddByRole = isAdmin || currentUser?.role === 'waiter' || currentUser?.role === 'staff';
  const canUseDirectOrder = isAdmin || settings.onlineOrderingEnabled;

  const isOrderable = item.inStock
    && canAddByRole
    && (effectiveMode === 'table' ? !!tableId : canUseDirectOrder);

  const handleAddItem = () => {
    if (!canAddByRole) {
      toast({
        title: "Restricted by Role",
        description: "Your role is not allowed to create orders. Ask admin to update access.",
        variant: "destructive"
      });
      return;
    }

    if (effectiveMode === 'direct' && !canUseDirectOrder) {
      toast({
        title: "Direct Ordering Disabled",
        description: "Admin has disabled direct/home ordering in settings.",
        variant: "destructive"
      });
      return;
    }

    if (effectiveMode !== 'direct' && !tableId) {
      toast({
        title: "No Table Selected",
        description: "Please select a table to start an order.",
        variant: "destructive"
      });
      return;
    }
    
    const tableNumber = effectiveMode === 'direct' ? 0 : parseInt(tableId || '0');
    addItemToOrder(item, tableNumber);
    toast({
      title: effectiveMode === 'direct' ? 'Added to Direct Order' : `Added to Table ${tableNumber}`,
      description: effectiveMode === 'direct' ? `${item.name} added to the direct order.` : `${item.name} added to Table ${tableNumber} order.`,
    });
  };
  
  const getDisabledTooltip = () => {
    if (!canAddByRole) return "Your role cannot create orders.";
    if (effectiveMode !== 'direct' && !tableId) return "Please select a table to start an order.";
    if (effectiveMode === 'direct' && !canUseDirectOrder) return "Direct/home ordering is disabled by admin.";
    if (!item.inStock) return "This item is out of stock";
    return "Add to order";
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="relative p-0">
        <Image
          src={item.image}
          alt={item.name}
          width={600}
          height={400}
          data-ai-hint={item.imageHint}
          className="h-28 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-32"
        />
        <Badge 
          className={cn(
            "absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            item.inStock 
              ? "border-emerald-300 bg-emerald-100 text-emerald-800" 
              : "border-rose-300 bg-rose-100 text-rose-700"
          )}
        >
          {item.inStock ? "In Stock" : "Out of Stock"}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow p-3">
        <CardTitle className="mb-1 line-clamp-1 text-base font-headline text-slate-900">{item.name}</CardTitle>
        <p className="line-clamp-2 text-xs text-slate-600 sm:text-sm">{item.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-3 pt-0">
        <p className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-bold text-amber-900">{formatCurrency(item.price, settings?.currency)}</p>
        <Button 
          disabled={!isOrderable} 
          onClick={handleAddItem}
          title={getDisabledTooltip()}
          className="h-8 rounded-full bg-orange-500 px-3 text-xs text-white shadow-sm hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-600 sm:text-sm"
        >
          <PlusCircle className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
