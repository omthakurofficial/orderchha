
'use client';

import { ChangeCalculator } from '@/components/billing/change-calculator';
import { TransactionList } from '@/components/billing/transaction-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

export default function BillingPage() {
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
                <div className="lg:col-span-2">
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
