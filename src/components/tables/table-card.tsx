"use client";

import type { Table } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image";

interface TableCardProps {
  table: Table;
}

const statusStyles = {
  available: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
  occupied: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  reserved: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
};

export function TableCard({ table }: TableCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:border-primary">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline">Table {table.id}</CardTitle>
                <Badge className={cn(statusStyles[table.status], "capitalize")}>
                  {table.status}
                </Badge>
            </div>
            <CardDescription className="flex items-center gap-2 pt-2">
              <Users className="w-4 h-4" />
              <span>{table.capacity} Seats</span>
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
       <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><QrCode /> Scan to view menu</DialogTitle>
          <DialogDescription>
            Customers at Table {table.id} can scan this QR code to access the digital menu on their smartphones.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center p-4">
            <Image
                src="https://placehold.co/256x256.png"
                alt="QR Code Placeholder"
                width={256}
                height={256}
                data-ai-hint="qr code"
                className="rounded-lg"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
