
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { MenuCategory, MenuItem } from '@/types';
import { MENU as initialMenu } from '@/lib/data';

// This file is being kept for now to avoid breaking changes, 
// but will be deprecated in favor of app-context.tsx

interface MenuContextType {
  menu: MenuCategory[];
  addMenuItem: (item: MenuItem, categoryName: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuCategory[]>(initialMenu);

  const addMenuItem = (item: MenuItem, categoryName: string) => {
    setMenu(prevMenu => {
      const newMenu = [...prevMenu];
      const categoryIndex = newMenu.findIndex(cat => cat.name === categoryName);

      if (categoryIndex > -1) {
        // Add item to existing category
        const updatedItems = [...newMenu[categoryIndex].items, item];
        newMenu[categoryIndex] = { ...newMenu[categoryIndex], items: updatedItems };
      } else {
        // This case should ideally not happen if categories are fixed
        // But as a fallback, we could create a new category.
        // For now, we assume category exists.
      }
      return newMenu;
    });
  };

  return (
    <MenuContext.Provider value={{ menu, addMenuItem }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
