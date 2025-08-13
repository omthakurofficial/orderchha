
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/app-context";
import { Eye, EyeOff, Utensils } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const authFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { signIn, signUp, isAuthLoading } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const handleAuthAction = async (data: AuthFormValues, action: 'signIn' | 'signUp') => {
    setIsSubmitting(true);
    try {
      if (action === 'signIn') {
        await signIn(data.email, data.password);
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
      } else {
        await signUp(data.email, data.password);
        toast({
          title: 'Sign Up Successful',
          description: 'Your account has been created.',
        });
      }
      // The AuthLayout will handle the redirect automatically.
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please sign in.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/invalid-api-key':
        case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
             errorMessage = 'The provided Firebase API key is not valid. Please check your configuration.';
             break;
      }
      
      toast({
        variant: 'destructive',
        title: action === 'signIn' ? 'Login Failed' : 'Sign Up Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary rounded-full p-3 w-fit text-primary-foreground mb-2">
                <Utensils className="w-8 h-8"/>
            </div>
          <CardTitle className="font-headline text-2xl">Sips & Slices Corner</CardTitle>
          <CardDescription>Enter your credentials to access the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <Form {...form}>
              <TabsContent value="signin">
                <form onSubmit={form.handleSubmit((data) => handleAuthAction(data, 'signIn'))} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email-login">Email</Label>
                        <FormControl>
                          <Input id="email-login" type="email" placeholder="admin@orderchha.com" {...field} />
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
                        <Label htmlFor="password-login">Password</Label>
                        <FormControl>
                          <div className="relative">
                            <Input id="password-login" type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute inset-y-0 right-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff /> : <Eye />}
                              <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit"
                    className="w-full" 
                    disabled={isSubmitting || isAuthLoading}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                 <form onSubmit={form.handleSubmit((data) => handleAuthAction(data, 'signUp'))} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email-signup">Email</Label>
                        <FormControl>
                          <Input id="email-signup" type="email" placeholder="your.email@example.com" {...field} />
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
                        <Label htmlFor="password-signup">Password</Label>
                        <FormControl>
                            <Input id="password-signup" type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit"
                    className="w-full" 
                    disabled={isSubmitting || isAuthLoading}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Form>
          </Tabs>
        </CardContent>
         <CardFooter className="flex justify-center text-xs text-muted-foreground">
            <p>Please contact an admin to manage roles.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
