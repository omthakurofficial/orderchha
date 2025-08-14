
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';
import type { UserFormData, UserRole } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const staffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(['admin', 'staff'], { required_error: "Please select a role."}),
  mobile: z.string().optional(),
  address: z.string().optional(),
  designation: z.string().optional(),
  photo: z.any().optional(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface AddStaffFormProps {
    onFormSubmit: (data: UserFormData, photoFile: File | null) => Promise<void>;
    onSuccess: () => void;
}

export function AddStaffForm({ onFormSubmit, onSuccess }: AddStaffFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const { toast } = useToast();

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'staff',
            mobile: '',
            address: '',
            designation: 'Staff',
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
          setPhotoFile(file);
        } else {
          setPreview(null);
          setPhotoFile(null);
        }
    };

    const onSubmit: SubmitHandler<StaffFormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            const formData: UserFormData = {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                mobile: data.mobile,
                address: data.address,
                designation: data.designation,
                joiningDate: new Date().toISOString(),
            };
            await onFormSubmit(formData, photoFile);
            toast({
                title: 'User Added',
                description: `${data.name} has been added to the system.`,
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error Adding User',
                description: 'Could not add the user. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                             <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="e.g., user@orderchha.cafe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="Min. 6 characters" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="designation" render={({ field }) => (
                             <FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="e.g., Waiter, Manager" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="space-y-4">
                       <FormField control={form.control} name="mobile" render={({ field }) => (
                            <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="Enter mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                           <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Enter address" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="photo" render={() => (
                            <FormItem>
                                <FormLabel>User Photo</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {preview && (
                             <div className="p-2 border rounded-md">
                                <Image src={preview} alt="Staff photo preview" width={100} height={100} className="rounded-md mx-auto" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Save />}
                        {isSubmitting ? 'Saving...' : 'Save User'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
