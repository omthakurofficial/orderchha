
'use client';

import { ActiveBills } from '@/components/billing/active-bills';
import { BillingActions } from '@/components/billing/billing-actions';
import { ChangeCalculator } from '@/components/billing/change-calculator';
import { TransactionList } from '@/components/billing/transaction-list';
import { TransactionTable } from '@/components/billing/transaction-table';
import { IndividualOrdersBilling } from '@/components/billing/individual-orders-billing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/app-context';
import { Receipt, Users, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BillingPage() {
    const { currentUser, isLoaded } = useApp();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'individual' | 'consolidated'>('individual');

    useEffect(() => {
        if (isLoaded && currentUser?.role !== 'admin' && currentUser?.role !== 'cashier' && currentUser?.role !== 'accountant') {
            router.push('/');
        }
    }, [currentUser, router, isLoaded]);

    // Show loading state if data is not yet loaded
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading billing data...</p>
            </div>
        );
    }

    if (currentUser?.role !== 'admin' && currentUser?.role !== 'cashier' && currentUser?.role !== 'accountant') {
        return (
            <div className="flex items-center justify-center h-full">
                <p>You do not have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-3 border-b">
                <h1 className="text-lg sm:text-xl font-bold font-headline flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Billing & Transactions
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Process payments and view transaction history.</p>
                
                {/* View Mode Toggle */}
                <div className="flex gap-1 mt-3">
                    <Button
                        onClick={() => setViewMode('individual')}
                        variant={viewMode === 'individual' ? 'default' : 'outline'}
                        size="sm"
                        className="flex items-center gap-1 text-xs h-8"
                    >
                        <FileText className="h-3 w-3" />
                        Individual Orders
                    </Button>
                    <Button
                        onClick={() => setViewMode('consolidated')}
                        variant={viewMode === 'consolidated' ? 'default' : 'outline'}
                        size="sm"
                        className="flex items-center gap-1 text-xs h-8"
                    >
                        <Users className="h-3 w-3" />
                        Consolidated Tables
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-3 md:p-4 overflow-auto pb-24 md:pb-6 space-y-4">
                {/* Quick Actions always visible */}
                <BillingActions />
                
                {/* Mobile Layout - Stack vertically */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        {viewMode === 'individual' ? (
                            <IndividualOrdersBilling />
                        ) : (
                            <ActiveBills />
                        )}
                        <TransactionTable />
                    </div>
                    <div className="order-first lg:order-last">
                         <Card className="h-fit">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Change Calculator</CardTitle>
                                <CardDescription className="text-xs">Calculate change to return.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <ChangeCalculator />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
