import { MenuUploadForm } from "@/components/menu/menu-upload-form";
import { MENU } from "@/lib/data";

export default function UploadMenuPage() {
    const categories = MENU.map(cat => cat.name);
  
    return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline">Menu Management</h1>
        <p className="text-muted-foreground">Add new items to your digital menu.</p>
      </header>
      <main className="flex-1 p-4 md:p-6 flex justify-center items-start">
        <MenuUploadForm categories={categories} />
      </main>
    </div>
  );
}
