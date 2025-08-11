
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { MenuCategory, MenuItem, Table } from '@/types';
import { MENU as initialMenu, TABLES as initialTables } from '@/lib/data';

interface AppContextType {
  // Menu state
  menu: MenuCategory[];
  addMenuItem: (item: MenuItem, categoryName: string) => void;
  // Table state
  tables: Table[];
  addTable: (capacity: number) => void;
  updateTableStatus: (tableId: number, status: Table['status']) => void;
  // Settings state
  settings: {
    cafeName: string;
    address: string;
    phone: string;
    logo: string;
  };
  updateSettings: (newSettings: Partial<AppContextType['settings']>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuCategory[]>(initialMenu);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [settings, setSettings] = useState({
    cafeName: 'Sips & Slices Corner',
    address: '123 Gourmet Street, Foodie City, 98765',
    phone: '(555) 123-4567',
    logo: '/logo.svg' // Assuming you have a logo in public folder
  });


  const addMenuItem = (item: MenuItem, categoryName: string) => {
    setMenu(prevMenu => {
      const newMenu = [...prevMenu];
      const categoryIndex = newMenu.findIndex(cat => cat.name === categoryName);

      if (categoryIndex > -1) {
        const updatedItems = [...newMenu[categoryIndex].items, item];
        newMenu[categoryIndex] = { ...newMenu[categoryIndex], items: updatedItems };
      }
      return newMenu;
    });
  };

  const addTable = (capacity: number) => {
    setTables(prevTables => {
      const newTableId = prevTables.length > 0 ? Math.max(...prevTables.map(t => t.id)) + 1 : 1;
      const newTable: Table = {
        id: newTableId,
        capacity,
        status: 'available'
      };
      return [...prevTables, newTable];
    });
  };

  const updateTableStatus = (tableId: number, status: Table['status']) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId ? { ...table, status } : table
      )
    );
  };

  const updateSettings = (newSettings: Partial<AppContextType['settings']>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  }

  return (
    <AppContext.Provider value={{ 
        menu, 
        addMenuItem, 
        tables,
        addTable, 
        updateTableStatus,
        settings,
        updateSettings 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
