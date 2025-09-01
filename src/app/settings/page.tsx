
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/context/app-context-supabase";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { toast } = useToast();
    const { settings, updateSettings, currentUser, isLoaded } = useApp();
    const [qrCodeUrl, setQrCodeUrl] = useState("https://placehold.co/256x256.png");
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && currentUser?.role !== 'admin') {
            router.push('/');
        }
    }, [currentUser, router, isLoaded]);

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully and will persist on this device.",
        });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        updateSettings({ [id]: value });
    }

    const handleSwitchChange = (id: string, checked: boolean) => {
        updateSettings({ [id]: checked });
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        setIsUploading(true);
        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            toast({
                variant: 'destructive',
                title: 'Image Upload Failed',
                description: 'ImgBB API Key is not configured. Please add it to the .env file.',
            });
            setIsUploading(false);
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
            if (result.success) {
                toast({
                    title: 'Logo Uploaded',
                    description: 'Your new logo has been uploaded successfully.',
                });
                return result.data.url;
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Logo upload error:', error);
            toast({
                variant: 'destructive',
                title: 'Logo Upload Failed',
                description: 'Could not upload the logo. Please try again.',
            });
            return null;
        } finally {
            setIsUploading(false);
        }
    }

    const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = await uploadImage(file);
            if (imageUrl) {
                updateSettings({ logo: imageUrl });
            }
        }
    };
    
    const generateQrCode = () => {
        if (settings?.paymentQrUrl && settings.paymentQrUrl.trim() !== '') {
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(settings.paymentQrUrl)}`);
            toast({
              title: "QR Code Generated",
              description: "The new QR code for your payment link is now displayed.",
            });
        } else {
            toast({
                variant: 'destructive',
                title: "Invalid URL",
                description: "Please enter a valid payment URL before generating a QR code.",
            });
        }
    }
    
    useEffect(() => {
        if (settings?.paymentQrUrl && settings.paymentQrUrl.trim() !== '') {
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(settings.paymentQrUrl)}`);
        } else {
            setQrCodeUrl("https://placehold.co/256x256.png");
        }
    }, [settings?.paymentQrUrl]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading settings...</p>
            </div>
        );
    }
    
    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-full">
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b">
                <h1 className="text-2xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your cafe's information and features.</p>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cafe Information</CardTitle>
                                <CardDescription>Update your cafe's public details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cafeName">Cafe Name</Label>
                                    <Input id="cafeName" value={settings?.cafeName || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea id="address" value={settings?.address || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={settings?.phone || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Cafe Logo</Label>
                                    <div className="flex items-center gap-4">
                                        <Input id="logo" type="file" onChange={handleLogoChange} accept="image/*" className="flex-1" disabled={isUploading} />
                                        {isUploading && <LoaderCircle className="animate-spin" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-1">Upload a new logo image. Best results with a square image.</p>
                                    {settings?.logo && (
                                        <div className="mt-4">
                                            <Image src={settings.logo} alt="Cafe Logo Preview" width={80} height={80} className="rounded-md border p-1" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Feature Management</CardTitle>
                                <CardDescription>Enable or disable features for your cafe.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 shadow-sm border rounded-lg">
                                    <div>
                                        <Label htmlFor="aiSuggestionsEnabled">AI Combo Suggestions</Label>
                                        <p className="text-xs text-muted-foreground">Show AI-powered meal recommendations to customers.</p>
                                    </div>
                                    <Switch 
                                        id="aiSuggestionsEnabled" 
                                        checked={settings?.aiSuggestionsEnabled || false} 
                                        onCheckedChange={(checked) => handleSwitchChange('aiSuggestionsEnabled', checked)} 
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 shadow-sm border rounded-lg">
                                     <div>
                                        <Label htmlFor="onlineOrderingEnabled">Online Ordering</Label>
                                        <p className="text-xs text-muted-foreground">Allow customers to place orders directly from the menu.</p>
                                    </div>
                                    <Switch 
                                        id="onlineOrderingEnabled" 
                                        checked={settings?.onlineOrderingEnabled || false} 
                                        onCheckedChange={(checked) => handleSwitchChange('onlineOrderingEnabled', checked)} 
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>QR Code Payment</CardTitle>
                                <CardDescription>Enter a payment link to generate a QR code.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center">
                                <div className="w-full space-y-2 mb-4">
                                    <Label htmlFor="paymentQrUrl">Payment URL</Label>
                                    <Input 
                                        id="paymentQrUrl" 
                                        placeholder="https://your-payment-link.com" 
                                        value={settings?.paymentQrUrl || ''} 
                                        onChange={handleInputChange} 
                                    />
                                </div>
                                <div className="p-4 border rounded-lg">
                                     <Image
                                        src={qrCodeUrl}
                                        alt="Payment QR Code"
                                        width={256}
                                        height={256}
                                        data-ai-hint="qr code"
                                        className="rounded-lg"
                                        unoptimized
                                    />
                                </div>
                                <Button className="mt-4 w-full" onClick={generateQrCode}>Generate New QR Code</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                 <div className="flex justify-end">
                    <Button onClick={handleSaveChanges} size="lg">Save All Changes</Button>
                </div>
            </main>
        </div>
    );
}
