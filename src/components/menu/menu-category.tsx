import type { MenuCategory as MenuCategoryType } from "@/types";
import { MenuItemCard } from "./menu-item-card";

interface MenuCategoryProps {
  category: MenuCategoryType;
}

export function MenuCategory({ category }: MenuCategoryProps) {
  const Icon = category.icon;
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold font-headline">{category.name}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
