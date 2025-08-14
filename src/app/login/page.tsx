
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/app-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LogIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { signIn } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const handleLogin = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            await signIn(data.email, data.password);
        } catch (authError: any) {
            if (authError.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
            console.error(authError);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <Image src="https://i.ibb.co/6r11CNc/logo.png" alt="Cafe Logo" width={80} height={80} className="mx-auto mb-4 rounded-full border p-1" />
                    <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
                    <CardDescription>Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="user@orderchha.cafe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && (
                                <p className="text-sm font-medium text-destructive">{error}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <LoaderCircle className="animate-spin" /> : <LogIn />}
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
