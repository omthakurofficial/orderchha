
'use client';

import { MenuCategory } from "@/components/menu/menu-category";
import { ComboSuggester } from "@/components/suggestions/combo-suggester";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/app-context";

export default function MenuPage() {
  const { menu: menuCategories } = useApp();

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold font-headline">Digital Menu</h1>
            <p className="text-muted-foreground">Browse our delicious offerings.</p>
          </div>
          <RadioGroup defaultValue="dine-in" className="flex items-center gap-4 mt-4 md:mt-0">
             <Label>Order Type:</Label>
             <div className="flex items-center space-x-2">
                <RadioGroupItem value="dine-in" id="dine-in" />
                <Label htmlFor="dine-in">Dine-in</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="takeaway" id="takeaway" />
                <Label htmlFor="takeaway">Takeaway</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery">Delivery</Label>
              </div>
          </RadioGroup>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-auto space-y-8">
        <ComboSuggester />
        <Separator />
        <div className="space-y-6">
            {menuCategories.map((category) => (
              <MenuCategory key={category.id} category={category} />
            ))}
        </div>
      </main>
    </div>
  );
}
