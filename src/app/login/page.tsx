
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/app-context";
import { Eye, EyeOff, Utensils, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { signIn, signUp } = useApp();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const handleAuthAction = async (action: 'signIn' | 'signUp', data: LoginFormValues) => {
    setIsSubmitting(true);
    const isSigningIn = action === 'signIn';
    const actionText = isSigningIn ? 'Signing In' : 'Signing Up';
    const actionTitle = isSigningIn ? 'Login' : 'Sign Up';

    try {
      if (isSigningIn) {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password);
      }
      
      toast({
        title: `${actionTitle} Successful`,
        description: isSigningIn ? 'Welcome back!' : 'Your account has been created.',
      });
      router.push('/');

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
          errorMessage = 'This email is already registered. Please sign in.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      toast({
        variant: 'destructive',
        title: `${actionTitle} Failed`,
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const onSubmit = (data: LoginFormValues) => {
    handleAuthAction('signIn', data);
  };
  
  const onSignUp = (data: LoginFormValues) => {
    handleAuthAction('signUp', data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">
            <Utensils /> <span className="ml-2">Sign In</span>
          </TabsTrigger>
          <TabsTrigger value="signup">
            <UserPlus /> <span className="ml-2">Sign Up</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </CardContent>
             <CardFooter className="flex justify-center text-xs text-muted-foreground">
                <p>New staff? Use the Sign Up tab.</p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="signup">
           <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">Create Account</CardTitle>
              <CardDescription>New staff members can sign up here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSignUp)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email-signup">Email</Label>
                        <FormControl>
                          <Input id="email-signup" type="email" placeholder="staff@orderchha.com" {...field} />
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
                          <div className="relative">
                            <Input id="password-signup" type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </form>
              </Form>
            </CardContent>
             <CardFooter className="flex justify-center text-xs text-muted-foreground">
                <p>Admins can manage roles after sign up.</p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
