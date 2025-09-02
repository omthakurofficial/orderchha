
"use client";

import type { Table } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, QrCode, MoreVertical, XCircle, Receipt, Wallet, Radio, ExternalLink, MapPin, Edit } from "lucide-react";
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
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { AddTableDialog } from "./add-table-dialog";
import { PaymentDialog } from "../billing/payment-dialog";

interface TableCardProps {
  table: Table;
}

const statusStyles = {
  available: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
  occupied: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800",
  reserved: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
  billing: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
  cleaning: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
  disabled: "bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

export function TableCard({ table }: { table: Table }) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'online' | 'credit' | 'qr' | 'card'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [applyVat, setApplyVat] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { settings, billingOrders, processPayment, updateTableStatus, currentUser, completeTransaction, setTables } = useApp();
  const { toast } = useToast();
  
  const ordersForTable = useMemo(() => {
    return billingOrders.filter(o => o.tableId === table.id);
  }, [billingOrders, table.id]);

  const billDetails = useMemo(() => {
    const subtotal = ordersForTable.reduce((acc, order) => acc + order.total, 0);
    const vat = applyVat ? subtotal * 0.13 : 0;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }, [ordersForTable, applyVat]);


  useEffect(() => {
    if (typeof window !== "undefined") {
        const currentOrigin = window.location.origin;
        const menuUrl = `${currentOrigin}/menu?table=${table.id}`;
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(menuUrl)}`);
    }
  }, [table.id]);

  const handleProcessPayment = (method: 'cash' | 'online') => {
    processPayment(table.id, method, applyVat);
    toast({
        title: "Payment Processed",
        description: `Table ${table.name}'s bill has been paid. The table is now available.`,
    });
  }

  const isInteractive = table.status !== 'disabled';

  const renderMainAction = () => {
      // Show payment button for both billing and cleaning status
      const needsPayment = table.status === 'billing' || table.status === 'cleaning';

      if (needsPayment) {
        return (
          <>
            <Button className="w-full mt-2" onClick={() => setShowPaymentDialog(true)}>
              <Wallet className="mr-2" /> Process Payment
            </Button>
            
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-2" disabled={!isInteractive}>
                    <Receipt className="mr-2" /> View Bill
                </Button>
            </DialogTrigger>
          </>
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

  // Simple payment dialog
  const PaymentDialogComponent = () => {
    if (!showPaymentDialog) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border rounded-lg shadow-lg p-6 w-[90%] max-w-md">
          <h3 className="text-lg font-semibold mb-4">Process Payment for {table.name}</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button 
              onClick={() => {
                // Process cash payment
                processPayment(table.id, 'cash', false);
                setShowPaymentDialog(false);
                toast({
                  title: "Payment Processed",
                  description: `Payment for ${table.name} completed successfully.`,
                });
              }}
              className="flex items-center justify-center"
            >
              Cash Payment
            </Button>
            
            <Button 
              onClick={() => {
                // Process online payment
                processPayment(table.id, 'online', false);
                setShowPaymentDialog(false);
                toast({
                  title: "Payment Processed",
                  description: `Online payment for ${table.name} completed successfully.`,
                });
              }}
              className="flex items-center justify-center"
            >
              Online Payment
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowPaymentDialog(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {PaymentDialogComponent()}
      <Dialog>
         <Card className={cn(
          "flex flex-col",
          !isInteractive && "cursor-not-allowed bg-muted opacity-60"
        )}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline">{table.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-2">
                  <Users className="w-4 h-4" />
                  <span>{table.capacity} Seats</span>
                </CardDescription>
                 <CardDescription className="flex items-center gap-2 pt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{table.location}</span>
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
                    <DropdownMenuRadioGroup value={table.status} onValueChange={(status) => updateTableStatus(table.id, status as Table['status'])}>
                        <DropdownMenuRadioItem value="available">Available</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="occupied">Occupied</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="reserved">Reserved</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="billing">Billing</DropdownMenuRadioItem>
                         {currentUser?.role === 'admin' && <DropdownMenuRadioItem value="disabled">Disabled</DropdownMenuRadioItem>}
                    </DropdownMenuRadioGroup>
                    {currentUser?.role === 'admin' && (
                        <>
                            <DropdownMenuSeparator />
                            <AddTableDialog 
                                table={table} 
                                trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Table
                                    </DropdownMenuItem>
                                }
                            />
                        </>
                    )}
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
                    Customers at {table.name} can scan this QR code to access the digital menu.
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
                        Bill for {table.name}
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
                                {order.items.map((item, index) => (
                                    <li key={`${item.id}-${index}`} className="flex justify-between items-center">
                                        <div>
                                            <span>{item.name}</span>
                                            <span className="text-muted-foreground font-bold ml-2">x{item.quantity}</span>
                                        </div>
                                        <span>{formatCurrency(item.price * item.quantity, settings?.currency)}</span>
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
                        <span className="font-medium">{formatCurrency(billDetails.subtotal, settings?.currency)}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="vat-switch" className="flex items-center gap-2">
                            Apply 13% VAT
                        </Label>
                        <Switch id="vat-switch" checked={applyVat} onCheckedChange={setApplyVat} />
                    </div>
                     {applyVat && (
                         <div className="flex justify-between">
                            <span>VAT (13%)</span>
                            <span className="font-medium">{formatCurrency(billDetails.vat, settings?.currency)}</span>
                        </div>
                    )}
                    <Separator />
                     <div className="flex justify-between text-lg font-bold text-primary">
                        <span>Total Due</span>
                        <span>{formatCurrency(billDetails.total, settings?.currency)}</span>
                    </div>
                </div>
                
                <Separator className="my-4" />

                <div className="flex flex-col gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" asChild>
                           <Link href={`/receipt/${table.id}?method=cash&vat=${applyVat}`} target="_blank">
                                <ExternalLink /> Preview Receipt
                           </Link>
                        </Button>
                    </DialogClose>
                </div>


                <DialogFooter className="grid grid-cols-1 gap-2 pt-4">
                    {/* Direct Process Payment button outside of Dialog component for better reliability */}
                    <Button 
                        className="w-full"
                        onClick={() => {
                            // Close the current dialog
                            const closeButton = document.querySelector('[data-state="open"]')?.querySelector('button[type="button"]');
                            if (closeButton instanceof HTMLElement) {
                              closeButton.click();
                            }
                            
                            // Small timeout to ensure dialog is closed first
                            setTimeout(() => {
                                // Create a payment directly
                                completeTransaction({
                                    id: `tr-${Date.now()}`,
                                    tableId: table.id,
                                    amount: billDetails.total,
                                    method: 'cash',
                                    timestamp: new Date().toISOString(),
                                }).then(() => {
                                    toast({
                                        title: '✅ Payment Processed',
                                        description: `Payment for Table ${table.id} completed successfully.`,
                                    });
                                    
                                    // Just mark the table as available locally
                                    updateTableStatus(table.id, 'available' as Table['status']);
                                    
                                    // Update local state directly as a fallback
                                    setTables((prevTables: Table[]) => 
                                        prevTables.map((t: Table) => 
                                            t.id === table.id ? {...t, status: 'available' as Table['status']} : t
                                        )
                                    );
                                });
                            }, 100);
                        }}
                    >
                        Process Cash Payment
                    </Button>
                    
                    {/* Link to receipt for cash payment */}
                    <DialogClose asChild>
                        <Button variant="outline" asChild className="mt-2">
                            <Link href={`/receipt/${table.id}?method=cash&vat=${applyVat}`}>
                                <Receipt className="mr-2 h-4 w-4" /> Print Receipt
                            </Link>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
       )}
      </Dialog>
    </>
  );
}
