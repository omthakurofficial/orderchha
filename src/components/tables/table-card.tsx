
"use client";

import type { KitchenOrder, Table } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, QrCode, MoreVertical, XCircle, Receipt, Wallet, Radio, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/app-context";
import { Button } from "../ui/button";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";

interface TableCardProps {
  table: Table;
}

const statusStyles = {
  available: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
  occupied: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800",
  reserved: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
  billing: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
  disabled: "bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

export function TableCard({ table }: TableCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("https://placehold.co/256x256.png");
  const [origin, setOrigin] = useState("");
  const { updateTableStatus, kitchenOrders, processPayment } = useApp();
  const { toast } = useToast();
  
  const ordersForTable = useMemo(() => {
    return kitchenOrders.filter(o => o.tableId === table.id && o.status === 'completed');
  }, [kitchenOrders, table.id]);

  const billTotal = useMemo(() => {
    const subtotal = ordersForTable.reduce((acc, order) => acc + order.total, 0);
    return subtotal * 1.13; // with VAT
  }, [ordersForTable]);

  useEffect(() => {
    if (typeof window !== "undefined") {
        const currentOrigin = window.location.origin;
        setOrigin(currentOrigin);
        const menuUrl = `${currentOrigin}/menu?table=${table.id}`;
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(menuUrl)}`);
    }
  }, [table.id]);

  const handleProcessPayment = (method: 'cash' | 'online') => {
    processPayment(table.id, method);
    toast({
        title: "Payment Processed",
        description: `Table ${table.id}'s bill has been paid. The table is now available.`,
    });
  }

  const isInteractive = table.status !== 'disabled';

  const renderMainAction = () => {
      const isBilling = table.status === 'billing';

      if (isBilling) {
        return (
            <DialogTrigger asChild>
                <Button className="w-full mt-4" disabled={!isInteractive}>
                    <Receipt /> View Bill
                </Button>
            </DialogTrigger>
        )
      }

      return (
         <Button asChild className="w-full mt-4" disabled={!isInteractive}>
            <Link href={`/menu?table=${table.id}`}>
                Go to Menu
            </Link>
        </Button>
      )
  }

  return (
    <Dialog>
       <Card className={cn(
        "flex flex-col",
        !isInteractive && "cursor-not-allowed bg-muted opacity-60"
      )}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline">Table {table.id}</CardTitle>
              <CardDescription className="flex items-center gap-2 pt-2">
                <Users className="w-4 h-4" />
                <span>{table.capacity} Seats</span>
              </CardDescription>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!isInteractive}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={table.status} onValueChange={(status) => updateTableStatus(table.id, status as Table['status'])}>
                        <DropdownMenuRadioItem value="available">Available</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="occupied">Occupied</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="reserved">Reserved</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="billing">Billing</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="disabled">Disabled</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
            <div className="flex items-center justify-between mt-auto">
                <Badge className={cn(statusStyles[table.status], "capitalize")}>
                    {table.status === 'disabled' && <XCircle className="w-3 h-3 mr-1" />}
                    {table.status === 'billing' && <Receipt className="w-3 h-3 mr-1" />}
                    {table.status}
                </Badge>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Show QR Code" disabled={!isInteractive}>
                        <QrCode />
                    </Button>
                </DialogTrigger>
            </div>
            {renderMainAction()}
        </CardContent>
      </Card>
      
       {table.status !== 'billing' ? (
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle className="font-headline flex items-center gap-2"><QrCode /> Scan to view menu</DialogTitle>
                <DialogDescription>
                    Customers at Table {table.id} can scan this QR code to access the digital menu on their smartphones.
                </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center p-4">
                    <Image
                        src={qrCodeUrl}
                        alt={`QR Code for Table ${table.id}`}
                        width={256}
                        height={256}
                        data-ai-hint="qr code"
                        className="rounded-lg"
                        unoptimized
                    />
                </div>
            </DialogContent>
       ) : (
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2">
                        <Receipt />
                        Bill for Table {table.id}
                    </DialogTitle>
                    <DialogDescription>
                        Review the bill details below before processing the payment.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[50vh] overflow-y-auto p-1 -mx-1">
                    {ordersForTable.length > 0 ? ordersForTable.map(order => (
                        <div key={order.id} className="mb-4">
                            <p className="text-sm font-semibold text-muted-foreground">Order placed at {new Date(order.timestamp).toLocaleTimeString()}</p>
                             <ul className="space-y-1 mt-1 text-sm">
                                {order.items.map(item => (
                                    <li key={item.id} className="flex justify-between items-center">
                                        <div>
                                            <span>{item.name}</span>
                                            <span className="text-muted-foreground font-bold ml-2">x{item.quantity}</span>
                                        </div>
                                        <span>NPR {(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )) : <p className="text-sm text-muted-foreground">No completed orders found for this table.</p>}
                </div>
                 <Separator />
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">NPR {(billTotal / 1.13).toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>VAT (13%)</span>
                        <span className="font-medium">NPR {(billTotal - (billTotal / 1.13)).toFixed(2)}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between text-lg font-bold text-primary">
                        <span>Total Due</span>
                        <span>NPR {billTotal.toFixed(2)}</span>
                    </div>
                </div>
                
                <Separator className="my-4" />

                <div className="flex flex-col gap-2">
                     <DialogClose asChild>
                        <Button variant="outline" asChild>
                           <Link href={`/receipt/${table.id}?method=cash`} target="_blank">
                                <ExternalLink /> Generate Cash Receipt
                           </Link>
                        </Button>
                    </DialogClose>
                     <DialogClose asChild>
                        <Button variant="outline" asChild>
                           <Link href={`/receipt/${table.id}?method=online`} target="_blank">
                                <ExternalLink /> Generate Online Receipt
                           </Link>
                        </Button>
                    </DialogClose>
                </div>


                <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                    <DialogClose asChild>
                        <Button variant="secondary" onClick={() => handleProcessPayment('cash')} disabled={ordersForTable.length === 0}>
                            <Wallet /> Paid by Cash
                        </Button>
                    </DialogClose>
                     <DialogClose asChild>
                        <Button onClick={() => handleProcessPayment('online')} disabled={ordersForTable.length === 0}>
                            <Radio /> Paid Online
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
       )}
    </Dialog>
  );
}
