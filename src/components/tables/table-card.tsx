
"use client";

import type { Table } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, QrCode, MoreVertical, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useEffect, useState } from "react";
import { useApp } from "@/context/app-context";
import { Button } from "../ui/button";

interface TableCardProps {
  table: Table;
}

const statusStyles = {
  available: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
  occupied: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  reserved: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
  disabled: "bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

export function TableCard({ table }: TableCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("https://placehold.co/256x256.png");
  const [origin, setOrigin] = useState("");
  const { updateTableStatus } = useApp();

  useEffect(() => {
    // window.location.origin is only available on the client side.
    // We use useEffect to prevent hydration errors.
    if (typeof window !== "undefined") {
        const currentOrigin = window.location.origin;
        setOrigin(currentOrigin);
        const menuUrl = `${currentOrigin}/menu?table=${table.id}`;
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(menuUrl)}`);
    }
  }, [table.id]);

  const isInteractive = table.status !== 'disabled';

  return (
    <Dialog>
      <Card className={cn(
        "hover:shadow-lg transition-shadow duration-300",
        isInteractive ? "cursor-pointer hover:border-primary" : "cursor-not-allowed bg-muted",
        (table.status !== 'available' && isInteractive) && "opacity-75"
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        <DropdownMenuRadioItem value="disabled">Disabled</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
            <Badge className={cn(statusStyles[table.status], "capitalize")}>
                {table.status === 'disabled' && <XCircle className="w-3 h-3 mr-1" />}
                {table.status}
            </Badge>
            <DialogTrigger asChild disabled={!isInteractive}>
              <Button variant="ghost" size="icon" aria-label="Show QR Code" disabled={!isInteractive}>
                <QrCode />
              </Button>
            </DialogTrigger>
        </CardContent>
      </Card>
      
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
                unoptimized // Required for external QR code service
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
