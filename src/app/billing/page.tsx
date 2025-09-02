
'use client';

import { ActiveBills } from '@/components/billing/active-bills';
import { BillingActions } from '@/components/billing/billing-actions';
import { ChangeCalculator } from '@/components/billing/change-calculator';
import { TransactionList } from '@/components/billing/transaction-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context-supabase';
import { Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BillingPage() {
    const { currentUser, isLoaded } = useApp();
    const router = useRouter();

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
            <header className="p-4 border-b">
                <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Receipt />
                    Billing & Transactions
                </h1>
                <p className="text-muted-foreground">Process payments and view transaction history.</p>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <BillingActions />
                    <ActiveBills />
                    <TransactionList />
                </div>
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Change Calculator</CardTitle>
                            <CardDescription>Quickly calculate the change to return to a customer.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChangeCalculator />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
