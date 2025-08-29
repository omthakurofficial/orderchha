
'use client';

import { MenuCategory } from "@/components/menu/menu-category";
import { OrderSummary } from "@/components/order/order-summary";
import { ComboSuggester } from "@/components/suggestions/combo-suggester";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/app-context-supabase";
import { Suspense } from "react";

function MenuPageContent() {
  const { menu: menuCategories, settings } = useApp();

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1 p-4 md:p-6 overflow-auto space-y-8">
        <header className="md:hidden p-4 border-b -m-4 mb-4 bg-background">
          <div className="flex flex-col">
            <div>
              <h1 className="text-2xl font-bold font-headline">Digital Menu</h1>
              <p className="text-muted-foreground">Browse our delicious offerings.</p>
            </div>
            <RadioGroup defaultValue="dine-in" className="flex items-center gap-4 mt-4">
              <Label>Order Type:</Label>
              <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dine-in" id="dine-in-sm" />
                  <Label htmlFor="dine-in-sm">Dine-in</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="takeaway" id="takeaway-sm" />
                  <Label htmlFor="takeaway-sm">Takeaway</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery-sm" />
                  <Label htmlFor="delivery-sm">Delivery</Label>
                </div>
            </RadioGroup>
          </div>
        </header>
        {settings.aiSuggestionsEnabled && (
          <>
            <ComboSuggester />
            <Separator />
          </>
        )}
        <div className="space-y-6">
            {menuCategories.map((category) => (
              <MenuCategory key={category.id} category={category} />
            ))}
        </div>
      </div>
      
      <aside className="w-full md:w-96 border-l bg-card flex flex-col">
        <div className="hidden md:flex p-4 border-b flex-col gap-4">
            <h2 className="text-xl font-bold font-headline">Your Order</h2>
            <RadioGroup defaultValue="dine-in" className="flex items-center gap-4">
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
        <OrderSummary />
      </aside>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div>Loading menu...</div>}>
      <MenuPageContent />
    </Suspense>
  )
}
