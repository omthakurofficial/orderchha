
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useApp } from '@/context/app-context';

const menuItemSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  category: z.string({ required_error: "Please select a category." }),
  inStock: z.boolean().default(true),
  image: z.any().refine(files => files?.length === 1, "Image is required."),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuUploadFormProps {
    categories: string[];
}

export function MenuUploadForm({ categories }: MenuUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { addMenuItem } = useApp();
  
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
        name: '',
        description: '',
        price: 0,
        inStock: true,
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('image', event.target.files);
    } else {
      setPreview(null);
      form.setValue('image', null);
    }
  };

  const onSubmit: SubmitHandler<MenuItemFormValues> = (data) => {
    const newItem = {
      id: `item-${Date.now()}`, // simple unique id
      name: data.name,
      description: data.description,
      price: data.price,
      inStock: data.inStock,
      image: preview!, // We know preview is not null if form is valid
      imageHint: `${data.name.toLowerCase()}`
    };

    addMenuItem(newItem, data.category);

    toast({
      title: 'Item Added Successfully',
      description: `${data.name} has been added to the menu.`,
    });
    form.reset();
    setPreview(null);
  };

  return (
    <Card className="w-full max-w-2xl">
        <CardHeader>
        <CardTitle>Add a New Menu Item</CardTitle>
        <CardDescription>
            Fill out the form below to add a new dish, drink, or snack to your menu.
        </CardDescription>
        </CardHeader>
        <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Margherita Pizza" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Describe the item..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price (NPR)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="e.g., 1250.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                        <FormField
                        control={form.control}
                        name="inStock"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                            <div className="space-y-0.5">
                                <FormLabel>In Stock</FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                </div>

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                            <FormLabel>Item Image</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={handleFileChange} {...rest} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    {preview && (
                    <div className="mt-4 border rounded-md p-2">
                        <h4 className="font-semibold mb-2 text-center">Image Preview</h4>
                        <Image
                        src={preview}
                        alt="Menu item preview"
                        width={400}
                        height={400}
                        className="rounded-md object-contain max-h-64 w-full"
                        />
                    </div>
                    )}
                </div>
            </div>

            <Button type="submit" className="w-full mt-6">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item to Menu
            </Button>
            </form>
        </Form>
        </CardContent>
    </Card>
  );
}
