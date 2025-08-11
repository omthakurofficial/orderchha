'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function UploadMenuPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
        setFile(null);
        setPreview(null);
    }
  };

  const handleUpload = () => {
    if (file) {
      // In a real app, you would handle the file upload to a server here.
      console.log('Uploading file:', file.name);
      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a menu image to upload.',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline">Upload Menu</h1>
        <p className="text-muted-foreground">Upload a photo of your menu.</p>
      </header>
      <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Menu Photo Uploader</CardTitle>
            <CardDescription>
              Select an image file of your menu to upload. This will be used to automatically update your digital menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <div className="mt-4 border rounded-md p-2">
                <h4 className="font-semibold mb-2 text-center">Image Preview</h4>
                <Image
                  src={preview}
                  alt="Menu preview"
                  width={400}
                  height={400}
                  className="rounded-md object-contain max-h-64 w-full"
                />
              </div>
            )}
            <Button onClick={handleUpload} className="w-full" disabled={!file}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Menu
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
