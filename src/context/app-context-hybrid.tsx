'use client';

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { multiDb } from '@/lib/multi-database';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

// Define app context types
interface AppContextType {
  isLoading: boolean;
  menu: any[];
  tables: any[];
  settings: any;
  databaseStatus: {
    active: string;
    supabaseAvailable: boolean;
    firebaseAvailable: boolean;
    usingLocalFallback: boolean;
  };
  refreshData: () => Promise<void>;
  addMenuItem: (item: any, categoryName: string) => Promise<any>;
  addTable: (tableData: any) => Promise<any>;
  updateTable: (tableId: number, tableData: any) => Promise<any>;
  updateSettings: (settings: any) => Promise<any>;
  getKitchenOrders: () => Promise<any[]>;
  placeOrder: (tableId: number, items: any[]) => Promise<any>;
  completeKitchenOrder: (orderId: string) => Promise<any>;
  getInventory: () => Promise<any[]>;
  updateInventory: (itemId: string, updates: any) => Promise<any>;
  getTransactions: () => Promise<any[]>;
  getUsers: () => Promise<any[]>;
  resetDatabase: () => void;
}

// Create the app context
const AppContext = createContext<AppContextType | null>(null);

// App provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [menu, setMenu] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [databaseStatus, setDatabaseStatus] = useState({
    active: 'loading',
    supabaseAvailable: false,
    firebaseAvailable: false,
    usingLocalFallback: false,
  });

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Get database status
      const status = multiDb.getDatabaseStatus();
      setDatabaseStatus(status);
      
      // Get menu data
      const menuData = await multiDb.getMenu();
      setMenu(menuData);
      
      // Get tables data
      const tablesData = await multiDb.getTables();
      setTables(tablesData);
      
      // Get settings
      const settingsData = await multiDb.getSettings();
      setSettings(settingsData);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: 'Connection Error',
        description: 'Could not connect to database. Using offline mode.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchData();
    
    // Set up table and order subscriptions if needed
    const tablesSubscription = multiDb.subscribeToTables
      ? multiDb.subscribeToTables((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            setTables((prevTables) => {
              const existing = prevTables.findIndex((t) => t.id === change.doc.id);
              if (existing >= 0) {
                return [
                  ...prevTables.slice(0, existing),
                  change.doc,
                  ...prevTables.slice(existing + 1),
                ];
              }
              return [...prevTables, change.doc];
            });
          } else if (change.type === 'removed') {
            setTables((prevTables) => prevTables.filter((t) => t.id !== change.doc.id));
          }
        })
      : { unsubscribe: () => {} };

    // Clean up subscriptions
    return () => {
      if (tablesSubscription) {
        tablesSubscription.unsubscribe();
      }
    };
  }, [fetchData]);

  // Reset to primary database
  const resetDatabase = useCallback(() => {
    multiDb.resetToDefault();
    const status = multiDb.getDatabaseStatus();
    setDatabaseStatus(status);
    toast({
      title: 'Database Reset',
      description: `Now using ${status.active} database.`,
    });
    fetchData();
  }, [fetchData]);

  // Add a menu item
  const addMenuItem = useCallback(async (item: any, categoryName: string) => {
    try {
      const result = await multiDb.addMenuItem(item, categoryName);
      await fetchData(); // Refresh data
      return result;
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: 'Error',
        description: 'Could not add menu item.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [fetchData]);

  // Add a table
  const addTable = useCallback(async (tableData: any) => {
    try {
      const result = await multiDb.addTable(tableData);
      await fetchData(); // Refresh data
      return result;
    } catch (error) {
      console.error('Error adding table:', error);
      toast({
        title: 'Error',
        description: 'Could not add table.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [fetchData]);

  // Update a table
  const updateTable = useCallback(async (tableId: number, tableData: any) => {
    try {
      const result = await multiDb.updateTable(tableId, tableData);
      await fetchData(); // Refresh data
      return result;
    } catch (error) {
      console.error('Error updating table:', error);
      toast({
        title: 'Error',
        description: 'Could not update table.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [fetchData]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: any) => {
    try {
      const result = await multiDb.updateSettings(newSettings);
      setSettings(result);
      return result;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Could not update settings.',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  // Get kitchen orders
  const getKitchenOrders = useCallback(async () => {
    try {
      return await multiDb.getKitchenOrders();
    } catch (error) {
      console.error('Error getting kitchen orders:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch kitchen orders.',
        variant: 'destructive',
      });
      return [];
    }
  }, []);

  // Place an order
  const placeOrder = useCallback(async (tableId: number, items: any[]) => {
    try {
      const result = await multiDb.placeOrder(tableId, items);
      // Update table status locally for immediate feedback
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === tableId ? { ...table, status: 'occupied' } : table
        )
      );
      return result;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'Could not place order.',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  // Complete a kitchen order
  const completeKitchenOrder = useCallback(async (orderId: string) => {
    try {
      return await multiDb.completeKitchenOrder(orderId);
    } catch (error) {
      console.error('Error completing kitchen order:', error);
      toast({
        title: 'Error',
        description: 'Could not complete order.',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  // Get inventory
  const getInventory = useCallback(async () => {
    try {
      return await multiDb.getInventory();
    } catch (error) {
      console.error('Error getting inventory:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch inventory.',
        variant: 'destructive',
      });
      return [];
    }
  }, []);

  // Update inventory
  const updateInventory = useCallback(async (itemId: string, updates: any) => {
    try {
      return await multiDb.updateInventoryItem(itemId, updates);
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Error',
        description: 'Could not update inventory.',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  // Get transactions
  const getTransactions = useCallback(async () => {
    try {
      return await multiDb.getTransactions();
    } catch (error) {
      console.error('Error getting transactions:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch transactions.',
        variant: 'destructive',
      });
      return [];
    }
  }, []);

  // Get users
  const getUsers = useCallback(async () => {
    try {
      return await multiDb.getUsers();
    } catch (error) {
      console.error('Error getting users:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch users.',
        variant: 'destructive',
      });
      return [];
    }
  }, []);

  // Context value
  const contextValue = {
    isLoading,
    menu,
    tables,
    settings,
    databaseStatus,
    refreshData: fetchData,
    addMenuItem,
    addTable,
    updateTable,
    updateSettings,
    getKitchenOrders,
    placeOrder,
    completeKitchenOrder,
    getInventory,
    updateInventory,
    getTransactions,
    getUsers,
    resetDatabase,
  };

  // Render with loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-pulse">Loading application data...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
}
