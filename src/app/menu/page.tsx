'use client';

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuCategory } from "@/components/menu/menu-category";
import { OrderSummary } from "@/components/order/order-summary";
import { ComboSuggester } from "@/components/suggestions/combo-suggester";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

function MenuPageContent() {
  const { menu: menuCategories, settings, currentTableId, getTableOrder, currentUser } = useApp();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cartOpen, setCartOpen] = useState(false);

  const totalItems = menuCategories.reduce((sum, category) => sum + category.items.length, 0);
  const tableIdFromQuery = searchParams.get('table');
  const mode = searchParams.get('mode') === 'direct' ? 'direct' : 'table';
  const isAdmin = currentUser?.role === 'admin';
  const effectiveMode = mode === 'direct' || (isAdmin && !tableIdFromQuery) ? 'direct' : 'table';
  const selectedTableId = tableIdFromQuery ? Number.parseInt(tableIdFromQuery, 10) : currentTableId;
  const cartTableId = effectiveMode === 'direct' ? 0 : (selectedTableId ?? null);
  const selectedOrder = cartTableId === null ? [] : getTableOrder(cartTableId);
  const selectedItemCount = selectedOrder.reduce((sum, item) => sum + item.quantity, 0);

  const categoryTotals = useMemo(() => {
    return menuCategories.map(category => ({
      id: category.id,
      name: category.name,
      count: category.items.length,
    }));
  }, [menuCategories]);

  const filteredCategories = useMemo(() => {
    return menuCategories
      .map(category => {
        const query = searchQuery.trim().toLowerCase();
        const filteredItems = category.items.filter(item => {
          const matchesQuery = !query || [item.name, item.description, category.name]
            .join(' ')
            .toLowerCase()
            .includes(query);

          const matchesCategory = activeCategory === 'all' || category.id === activeCategory;
          return matchesQuery && matchesCategory;
        });

        return {
          ...category,
          items: filteredItems,
        };
      })
      .filter(category => category.items.length > 0);
  }, [menuCategories, searchQuery, activeCategory]);

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <div className="flex-1 space-y-4 overflow-y-auto p-2.5 pb-24 md:p-4 md:pb-6">
        <section className="app-section space-y-3 bg-gradient-to-br from-white via-orange-50/80 to-amber-50/60 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm">
                <Menu className="h-3.5 w-3.5" />
                Waiter Mode
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold text-slate-900 sm:text-3xl">Order Taking Console</h1>
                <p className="max-w-2xl text-xs text-slate-600 sm:text-sm md:text-base">
                  Fast in-house ordering for staff. Search items, jump categories, and manage table orders in seconds.
                </p>
              </div>
            </div>
            <div className="hidden min-w-[160px] rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-right shadow-sm md:block">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Catalog</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{totalItems}</p>
              <p className="text-xs text-slate-500">items available</p>
            </div>
          </div>

          <div className="grid gap-2.5 md:grid-cols-[1.5fr_1fr]">
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search dishes, drinks, or snacks..."
                className="h-11 rounded-2xl border-slate-200 bg-white pl-4 pr-4 text-sm shadow-sm md:h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm md:gap-2 md:p-2">
              <Button asChild variant={mode === 'table' ? 'default' : 'outline'} className="h-11 w-full rounded-xl text-xs sm:text-sm">
                <Link href="/menu">
                  Table Order
                </Link>
              </Button>
              <Button asChild variant={mode === 'direct' ? 'default' : 'outline'} className="h-11 w-full rounded-xl text-xs sm:text-sm">
                <Link href="/menu?mode=direct">
                  Direct Order
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              {effectiveMode === 'direct'
                ? isAdmin && mode === 'table' && !tableIdFromQuery
                  ? 'Admin Quick Order (Direct Cart)'
                  : 'Direct / Home Order'
                : tableIdFromQuery
                  ? `Table ${tableIdFromQuery}`
                  : 'Pick a table to start'}
            </div>
            {mode === 'table' && !tableIdFromQuery && !isAdmin && (
              <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                Open a table first to build a table cart.
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Button
              type="button"
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              className="h-8 rounded-full px-3.5 text-xs sm:h-9 sm:px-4 sm:text-sm"
              onClick={() => setActiveCategory('all')}
            >
              All ({totalItems})
            </Button>
            {categoryTotals.map((category) => (
              <Button
                key={category.id}
                type="button"
                variant={activeCategory === category.id ? 'default' : 'outline'}
                className="h-8 rounded-full px-3.5 text-xs whitespace-nowrap sm:h-9 sm:px-4 sm:text-sm"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </section>

        {settings.aiSuggestionsEnabled && (
          <div className="hidden md:block">
            <ComboSuggester />
            <Separator className="mt-4" />
          </div>
        )}

        <div className="space-y-5">
          {filteredCategories.map((category) => (
            <MenuCategory key={category.id} category={category} />
          ))}
        </div>
      </div>

      <aside className="hidden h-full w-[22rem] border-l border-slate-200/80 bg-card/95 md:block">
        <div className="border-b border-slate-200/80 p-4">
          <h2 className="font-headline text-xl font-bold text-slate-900">{effectiveMode === 'direct' ? 'Direct Order' : 'Table Order'}</h2>
          <p className="text-sm text-slate-500">
            {effectiveMode === 'direct' ? 'Review direct/home order items before sending to kitchen.' : 'Review selected items before sending to kitchen.'}
          </p>
          {effectiveMode === 'table' && (
            <RadioGroup defaultValue="dine-in" className="mt-4 grid grid-cols-3 gap-2">
              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2">
                <RadioGroupItem value="dine-in" id="dine-in" />
                <Label htmlFor="dine-in" className="text-xs font-medium">Dine-in</Label>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2">
                <RadioGroupItem value="takeaway" id="takeaway" />
                <Label htmlFor="takeaway" className="text-xs font-medium">Takeaway</Label>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="text-xs font-medium">Delivery</Label>
              </div>
            </RadioGroup>
          )}
        </div>
        <OrderSummary />
      </aside>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            className={cn(
              "fixed bottom-24 right-4 z-30 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-5 text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-500 md:hidden",
              selectedItemCount > 0 ? "pl-4 pr-5" : "px-5"
            )}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {effectiveMode === 'direct' ? 'Direct Cart' : 'Cart'}
            {selectedItemCount > 0 && (
              <Badge className="ml-2 rounded-full bg-white/20 px-2 py-0 text-xs text-white hover:bg-white/20">
                {selectedItemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="z-[60] h-[88dvh] rounded-t-3xl border-slate-200 bg-card p-0 md:hidden">
          <SheetHeader className="border-b border-slate-200 px-4 py-4 text-left">
            <SheetTitle className="font-headline text-xl text-slate-900">{effectiveMode === 'direct' ? 'Direct Order' : 'Table Order'}</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(88dvh-4.5rem)] overflow-hidden">
            <OrderSummary />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div>Loading menu...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}
