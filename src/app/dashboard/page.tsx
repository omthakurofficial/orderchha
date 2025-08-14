
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/app-context";
import { DollarSign, LayoutDashboard, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { transactions, currentUser } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            router.push('/');
        }
    }, [currentUser, router]);

    const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);
    const cashRevenue = transactions.filter(t => t.method === 'cash').reduce((acc, t) => acc + t.amount, 0);
    const onlineRevenue = transactions.filter(t => t.method === 'online').reduce((acc, t) => acc + t.amount, 0);
    const totalOrders = transactions.length;
    
    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-full">
                <p>You do not have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <LayoutDashboard />
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">Today's business at a glance.</p>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/20">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">NPR {totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">from {totalOrders} orders</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">NPR {cashRevenue.toFixed(2)}</div>
                             <p className="text-xs text-muted-foreground">
                                {((cashRevenue / totalRevenue) * 100 || 0).toFixed(1)}% of total
                            </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Online Payments</CardTitle>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">NPR {onlineRevenue.toFixed(2)}</div>
                             <p className="text-xs text-muted-foreground">
                                {((onlineRevenue / totalRevenue) * 100 || 0).toFixed(1)}% of total
                            </p>
                        </CardContent>
                    </Card>
                </div>
                {/* We can add charts and recent transactions here later */}
            </main>
        </div>
    );
}
