
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/app-context";
import { DollarSign, LayoutDashboard, Package, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NotificationPanel } from "@/components/notifications/notification-panel";

export default function DashboardPage() {
    const { completedTransactions, currentUser, inventory, isLoaded } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && currentUser?.role !== 'admin') {
            router.push('/');
        }
    }, [currentUser, router, isLoaded]);

    // Make sure completedTransactions exists before using it
    const transactions = completedTransactions || [];
    
    const totalRevenue = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
    const cashRevenue = transactions.filter(t => t?.method === 'cash').reduce((acc, t) => acc + (t.amount || 0), 0);
    const onlineRevenue = transactions.filter(t => t?.method === 'online').reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalOrders = transactions.length;

    // Make sure inventory exists before using it
    const inventoryItems = inventory || [];
    const totalInventoryValue = inventoryItems.reduce(
        (acc, item) => acc + ((item?.stock || 0) * (item?.purchasePrice || 0)), 
        0
    );
    
    // If not yet loaded, show loading state
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading dashboard...</p>
            </div>
        )
    }
    
    // If loaded but not admin, show permission error
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
                <div className="max-w-6xl mx-auto space-y-6 dashboard-container">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 dashboard-card-grid">
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
                                    {totalRevenue > 0 ? ((cashRevenue / totalRevenue) * 100).toFixed(1) : "0.0"}% of total
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
                                    {totalRevenue > 0 ? ((onlineRevenue / totalRevenue) * 100).toFixed(1) : "0.0"}% of total
                                </p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">NPR {totalInventoryValue.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">Total value of all stock items</p>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            {/* We can add charts and recent transactions here later */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-muted-foreground py-8">
                                        Charts and recent activity will be added here
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div>
                            <NotificationPanel 
                                maxNotifications={8} 
                                className="sticky top-4"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
