import type { MenuCategory as MenuCategoryType } from "@/types";
import { MenuItemCard } from "./menu-item-card";
import { Flame, GlassWater, IceCream2, Salad, Pizza, Utensils } from 'lucide-react';

interface MenuCategoryProps {
  category: MenuCategoryType;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Flame,
  GlassWater,
  IceCream2,
  Salad,
  Pizza,
  Utensils,
};


export function MenuCategory({ category }: MenuCategoryProps) {
  const Icon = iconMap[category.icon] || Utensils; // Fallback to a default icon
  // Filter out duplicate items by ID
  const uniqueItems = category.items.reduce((acc, current) => {
    const isDuplicate = acc.find(item => item.id === current.id);
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, [] as typeof category.items);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold font-headline text-slate-900 sm:text-2xl">{category.name}</h2>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {uniqueItems.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {uniqueItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
