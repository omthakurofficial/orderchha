
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { MenuCategory, MenuItem, Table, Settings } from '@/types';
import { MENU as initialMenu, TABLES as initialTables } from '@/lib/data';

interface AppContextType {
  isLoaded: boolean;
  menu: MenuCategory[];
  addMenuItem: (item: MenuItem, categoryName: string) => void;
  tables: Table[];
  addTable: (capacity: number) => void;
  updateTableStatus: (tableId: number, status: Table['status']) => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialSettings: Settings = {
  cafeName: 'Sips & Slices Corner',
  address: '123 Gourmet Street, Foodie City, 98765',
  phone: '(555) 123-4567',
  logo: '',
  aiSuggestionsEnabled: true,
  onlineOrderingEnabled: true,
  paymentQrUrl: 'https://www.example.com/pay',
};

// Helper to get data from localStorage
const loadState = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return defaultValue;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error(`Error loading state for key "${key}" from localStorage`, error);
    return defaultValue;
  }
};

// Helper to save data to localStorage
const saveState = <T,>(key: string, value: T) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const serializedState = JSON.stringify(value);
        localStorage.setItem(key, serializedState);
    } catch (error) {
        console.error(`Error saving state for key "${key}" to localStorage`, error);
    }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [settings, setSettings] = useState<Settings>(initialSettings);

  // Load initial state from localStorage on mount
  useEffect(() => {
    setMenu(loadState('dineswift-menu', initialMenu));
    setTables(loadState('dineswift-tables', initialTables));
    setSettings(loadState('dineswift-settings', initialSettings));
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
        saveState('dineswift-menu', menu);
    }
  }, [menu, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
        saveState('dineswift-tables', tables);
    }
  }, [tables, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
        saveState('dineswift-settings', settings);
    }
  }, [settings, isLoaded]);


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

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  }

  const value = { 
    isLoaded,
    menu, 
    addMenuItem, 
    tables,
    addTable, 
    updateTableStatus,
    settings,
    updateSettings 
  };

  return (
    <AppContext.Provider value={value}>
      {isLoaded ? children : null /* Or a loading spinner */}
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
