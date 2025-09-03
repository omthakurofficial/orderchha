
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/app-context';

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                 <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Total Bill Amount</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    placeholder="130.00" 
                                    className="h-8 text-sm"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="amountReceived"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Amount Received</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    placeholder="1000.00" 
                                    className="h-8 text-sm"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />
                <Button type="submit" size="sm" className="w-full h-8 text-xs">Calculate Change</Button>

                {change !== null && (
                    <div className="pt-2 space-y-2">
                        <Separator />
                        <div className="text-center py-2 bg-green-50 rounded border">
                            <p className="text-xs text-gray-600">Change to Return:</p>
                            <p className="text-lg font-bold text-primary">{settings?.currency || 'NPR'} {change.toFixed(2)}</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={handleReset}>Reset</Button>
                    </div>
                )}
            </form>
        </Form>
    );
}

