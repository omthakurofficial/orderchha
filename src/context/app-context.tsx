
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { MenuCategory, MenuItem, Table, Settings, OrderItem, KitchenOrder } from '@/types';
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
  order: OrderItem[];
  addItemToOrder: (item: MenuItem) => void;
  removeItemFromOrder: (itemId: string) => void;
  updateOrderItemQuantity: (itemId: string, quantity: number) => void;
  clearOrder: () => void;
  placeOrder: (tableId: number) => void;
  kitchenOrders: KitchenOrder[];
  completeKitchenOrder: (orderId: string) => void;
  pendingOrders: KitchenOrder[];
  approvePendingOrder: (orderId: string) => void;
  rejectPendingOrder: (orderId: string) => void;
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
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<KitchenOrder[]>([]);


  // Load initial state from localStorage on mount
  useEffect(() => {
    setMenu(loadState('dineswift-menu', initialMenu));
    setTables(loadState('dineswift-tables', initialTables));
    setSettings(loadState('dineswift-settings', initialSettings));
    setOrder(loadState('dineswift-order', []));
    setKitchenOrders(loadState('dineswift-kitchen-orders', []));
    setPendingOrders(loadState('dineswift-pending-orders', []));
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => { if (isLoaded) saveState('dineswift-menu', menu); }, [menu, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('dineswift-tables', tables); }, [tables, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('dineswift-settings', settings); }, [settings, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('dineswift-order', order); }, [order, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('dineswift-kitchen-orders', kitchenOrders); }, [kitchenOrders, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('dineswift-pending-orders', pendingOrders); }, [pendingOrders, isLoaded]);

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

  const addItemToOrder = (item: MenuItem) => {
    setOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.id === item.id);
      if (existingItem) {
        return prevOrder.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      }
      return [...prevOrder, { ...item, quantity: 1 }];
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    setOrder(prevOrder => prevOrder.filter(orderItem => orderItem.id !== itemId));
  };

  const updateOrderItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }
    setOrder(prevOrder =>
      prevOrder.map(orderItem =>
        orderItem.id === itemId ? { ...orderItem, quantity } : orderItem
      )
    );
  };

  const clearOrder = () => {
    setOrder([]);
  };

  const placeOrder = (tableId: number) => {
    if (order.length === 0) return;

    const newPendingOrder: KitchenOrder = {
        id: `order-${Date.now()}`,
        tableId,
        items: [...order],
        status: 'pending',
        timestamp: new Date().toISOString(),
        total: order.reduce((acc, item) => acc + item.price * item.quantity, 0)
    };
    
    setPendingOrders(prev => [...prev, newPendingOrder]);
    clearOrder();
  }
  
  const completeKitchenOrder = (orderId: string) => {
    setKitchenOrders(prev => prev.map(o => o.id === orderId ? {...o, status: 'completed'} : o))
  }
  
  const approvePendingOrder = (orderId: string) => {
    const orderToApprove = pendingOrders.find(o => o.id === orderId);
    if (!orderToApprove) return;

    // Move from pending to kitchen
    setKitchenOrders(prev => [...prev, orderToApprove]);
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));

    // Update table status
    updateTableStatus(orderToApprove.tableId, 'occupied');
  };

  const rejectPendingOrder = (orderId: string) => {
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
  };


  const value = { 
    isLoaded,
    menu, 
    addMenuItem, 
    tables,
    addTable, 
    updateTableStatus,
    settings,
    updateSettings,
    order,
    addItemToOrder,
    removeItemFromOrder,
    updateOrderItemQuantity,
    clearOrder,
    placeOrder,
    kitchenOrders,
    completeKitchenOrder,
    pendingOrders,
    approvePendingOrder,
    rejectPendingOrder,
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
