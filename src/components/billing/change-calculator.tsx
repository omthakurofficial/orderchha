
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/app-context-supabase';

const calculatorSchema = z.object({
  totalAmount: z.coerce.number().positive("Total amount must be positive."),
  amountReceived: z.coerce.number().positive("Amount received must be positive."),
}).refine(data => data.amountReceived >= data.totalAmount, {
    message: "Amount received must be greater than or equal to the total amount.",
    path: ["amountReceived"],
});

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

export function ChangeCalculator() {
    const [change, setChange] = useState<number | null>(null);
    const { settings } = useApp();

    const form = useForm<CalculatorFormValues>({
        resolver: zodResolver(calculatorSchema),
        defaultValues: {
            totalAmount: 0,
            amountReceived: 0,
        },
    });
    
    const onSubmit: SubmitHandler<CalculatorFormValues> = (data) => {
        setChange(data.amountReceived - data.totalAmount);
    };

    const handleReset = () => {
        form.reset();
        setChange(null);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Bill Amount</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 130.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="amountReceived"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount Received from Customer</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 1000.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Calculate Change</Button>

                {change !== null && (
                    <div className="pt-4 space-y-4">
                        <Separator />
                        <div className="text-center">
                            <p className="text-lg font-semibold">Change to Return:</p>
                            <p className="text-3xl font-bold text-primary">{settings?.currency || 'NPR'} {change.toFixed(2)}</p>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleReset}>Reset</Button>
                    </div>
                )}
            </form>
        </Form>
    );
}

