
'use client';

import { useApp } from "@/context/app-context-supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function TransactionList() {
    const { transactions } = useApp();

    if (transactions.length === 0) {
        return (
            <Card className="h-full">
                 <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A list of all payments processed today.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-muted/40 h-64">
                        <Receipt className="w-16 h-16 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-bold text-muted-foreground">No Transactions Yet</h2>
                        <p className="text-muted-foreground">Completed payments will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>A list of all payments processed today.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg max-h-[60vh] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Table</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead className="text-right">Receipt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                                    <TableCell className="font-semibold">Table {tx.tableId}</TableCell>
                                    <TableCell className="font-bold text-primary">NPR {tx.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={tx.method === 'cash' ? 'secondary' : 'default'} className="capitalize">{tx.method}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/receipt/${tx.tableId}?method=${tx.method}`} target="_blank">
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
