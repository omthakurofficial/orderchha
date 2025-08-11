
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function SettingsPage() {
    const { toast } = useToast();
    const { settings, updateSettings } = useApp();

    const handleSaveChanges = () => {
        // Here you would handle form submission, e.g., by calling updateSettings
        toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
        });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        updateSettings({ [id]: value });
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
                                    <Input id="cafeName" value={settings.cafeName} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea id="address" value={settings.address} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={settings.phone} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cafe-logo">Cafe Logo</Label>
                                    <Input id="cafe-logo" type="file" />
                                    <p className="text-xs text-muted-foreground pt-1">Upload a new logo image.</p>
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
                                        <Label htmlFor="ai-suggestions">AI Combo Suggestions</Label>
                                        <p className="text-xs text-muted-foreground">Show AI-powered meal recommendations to customers.</p>
                                    </div>
                                    <Switch id="ai-suggestions" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-3 shadow-sm border rounded-lg">
                                     <div>
                                        <Label htmlFor="online-orders">Online Ordering</Label>
                                        <p className="text-xs text-muted-foreground">Allow customers to place orders directly from the menu.</p>
                                    </div>
                                    <Switch id="online-orders" defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>QR Code Payment</CardTitle>
                                <CardDescription>Display a QR code for easy payments.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center">
                                <div className="p-4 border rounded-lg">
                                     <Image
                                        src="https://placehold.co/256x256.png"
                                        alt="Payment QR Code Placeholder"
                                        width={256}
                                        height={256}
                                        data-ai-hint="qr code"
                                        className="rounded-lg"
                                    />
                                </div>
                                <Button className="mt-4 w-full">Generate New QR Code</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                 <div className="flex justify-end">
                    <Button onClick={handleSaveChanges} size="lg">Save Changes</Button>
                </div>
            </main>
        </div>
    );
}
