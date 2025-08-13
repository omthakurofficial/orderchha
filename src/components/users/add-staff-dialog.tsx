
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoaderCircle, PlusCircle, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useApp } from '@/context/app-context';

const addStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  mobile: z.string().min(10, "Enter a valid mobile number."),
  address: z.string().min(3, "Address is required."),
  designation: z.string().min(2, "Designation is required."),
  photo: z.any().refine(files => files?.length === 1, "Photo is required."),
});

type AddStaffFormValues = z.infer<typeof addStaffSchema>;

export function AddStaffDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { addStaffUser } = useApp();
  const { toast } = useToast();

  const form = useForm<AddStaffFormValues>({
    resolver: zodResolver(addStaffSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      mobile: '',
      address: '',
      designation: '',
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      form.setValue('photo', event.target.files);
    } else {
      setPreview(null);
      form.setValue('photo', null);
    }
  };
  
  const uploadImage = async (file: File): Promise<string | null> => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      toast({
        variant: 'destructive',
        title: 'Image Upload Failed',
        description: 'ImgBB API Key is not configured.',
      });
      return null;
    }
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      return result.success ? result.data.url : null;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  }

  const onSubmit: SubmitHandler<AddStaffFormValues> = async (data) => {
    setIsSubmitting(true);
    
    const imageFile = data.photo[0] as File;
    const photoUrl = await uploadImage(imageFile);

    if (!photoUrl) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload staff photo.' });
        setIsSubmitting(false);
        return;
    }

    try {
      await addStaffUser({
          name: data.name,
          email: data.email,
          password: data.password,
          mobile: data.mobile,
          address: data.address,
          designation: data.designation,
          photoUrl: photoUrl
      });
      toast({
        title: 'Staff Added',
        description: `${data.name} has been added and can now log in.`,
      });
      form.reset();
      setPreview(null);
      setOpen(false);
    } catch (error: any) {
        console.error(error);
        let description = 'Could not create staff account.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already registered.';
        }
        toast({ variant: 'destructive', title: 'Error', description });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus />
          Add New Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Create login credentials and store information for a new staff member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="staff@orderchha.com" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="mobile" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="+1234567890" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="address" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St, Anytown" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="designation" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="e.g., Waiter, Chef" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="photo" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Staff Photo</FormLabel><FormControl><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl><FormMessage /></FormItem>
            )}/>
            {preview && (
                <div className="border rounded-md p-2 w-fit mx-auto">
                    <Image src={preview} alt="Staff photo preview" width={100} height={100} className="rounded-md object-cover" />
                </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : <PlusCircle />}
              {isSubmitting ? 'Creating Account...' : 'Add Staff Member'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
