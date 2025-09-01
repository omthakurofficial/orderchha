// Multi-Database Adapter - Provides fallback capabilities between Supabase and Firebase
import { db as supabaseDb, supabase } from './supabase';
import { initFirebase } from './firebase-bridge'; // We'll create this file
import type { MenuCategory, MenuItem, Table, Settings, KitchenOrder, InventoryItem, Transaction, User } from '@/types';

// Flag to track which database is active
let activeDatabase: 'supabase' | 'firebase' | 'local' = 'supabase';

// Initialize the Firebase database if needed
const { db: firebaseDb, isFirebaseAvailable } = initFirebase();

// Helper to switch database system
const switchToFallback = () => {
  console.log(`⚠️ Switching from ${activeDatabase} to fallback...`);
  
  // Determine the next fallback
  if (activeDatabase === 'supabase') {
    activeDatabase = isFirebaseAvailable ? 'firebase' : 'local';
  } else if (activeDatabase === 'firebase') {
    activeDatabase = 'local';
  }
  
  console.log(`✅ Now using ${activeDatabase} database`);
};

// Wrap database operations with fallback capabilities
const withFallback = async <T>(
  operation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  localFallback: () => T
): Promise<T> => {
  try {
    if (activeDatabase === 'supabase') {
      return await operation();
    } else if (activeDatabase === 'firebase' && isFirebaseAvailable) {
      return await fallbackOperation();
    } else {
      return localFallback();
    }
  } catch (error) {
    console.error(`Error in ${activeDatabase} operation:`, error);
    switchToFallback();
    
    // Try the fallback
    try {
      if (activeDatabase === 'firebase' && isFirebaseAvailable) {
        return await fallbackOperation();
      } else {
        return localFallback();
      }
    } catch (fallbackError) {
      console.error('Error in fallback operation:', fallbackError);
      // Final fallback to local data
      activeDatabase = 'local';
      return localFallback();
    }
  }
};

// Multi-database adapter with fallback capabilities
export const multiDb = {
  // Debug/status information
  getDatabaseStatus: () => ({
    active: activeDatabase,
    supabaseAvailable: activeDatabase === 'supabase',
    firebaseAvailable: isFirebaseAvailable,
    usingLocalFallback: activeDatabase === 'local',
  }),
  
  // Reset to try primary database again
  resetToDefault: () => {
    activeDatabase = 'supabase';
    return { active: activeDatabase };
  },
  
  // Menu operations
  async getMenu(): Promise<MenuCategory[]> {
    return withFallback(
      // Supabase operation
      async () => {
        const data = await supabaseDb.getMenu();
        return data || [];
      },
      // Firebase fallback
      async () => {
        const data = await firebaseDb.getMenu();
        return data || [];
      },
      // Local data fallback
      () => {
        // Import here to avoid circular dependencies
        const { MENU } = require('./data');
        return MENU;
      }
    );
  },
  
  async addMenuItem(item: MenuItem, categoryName: string): Promise<MenuItem> {
    return withFallback(
      async () => {
        const result = await supabaseDb.addMenuItem(categoryName, item);
        return result;
      },
      async () => {
        const result = await firebaseDb.addMenuItem(categoryName, item);
        return result;
      },
      () => {
        console.log('Adding item to local memory only (will be lost on refresh):', item);
        return item;
      }
    );
  },
  
  // Tables operations
  async getTables(): Promise<Table[]> {
    return withFallback(
      async () => {
        const data = await supabaseDb.getTables();
        return data || [];
      },
      async () => {
        const data = await firebaseDb.getTables();
        return data || [];
      },
      () => {
        // Import here to avoid circular dependencies
        const { TABLES } = require('./data');
        return TABLES;
      }
    );
  },
  
  async addTable(tableData: Omit<Table, 'id' | 'status'>): Promise<Table> {
    return withFallback(
      async () => {
        const result = await supabaseDb.addTable(tableData);
        return result;
      },
      async () => {
        const result = await firebaseDb.addTable(tableData);
        return result;
      },
      () => {
        // Just return a mock table with the data
        const newTable = {
          ...tableData,
          id: Math.floor(Math.random() * 1000),
          status: 'available'
        };
        console.log('Adding table to local memory only (will be lost on refresh):', newTable);
        return newTable;
      }
    );
  },
  
  async updateTable(tableId: number, tableData: Partial<Omit<Table, 'id'>>): Promise<Table> {
    return withFallback(
      async () => {
        const result = await supabaseDb.updateTable(tableId, tableData);
        return result;
      },
      async () => {
        const result = await firebaseDb.updateTable(tableId, tableData);
        return result;
      },
      () => {
        console.log('Updating table in local memory only (will be lost on refresh):', tableId, tableData);
        return { id: tableId, ...tableData } as Table;
      }
    );
  },
  
  // Settings operations
  async getSettings(): Promise<Settings> {
    return withFallback(
      async () => {
        const data = await supabaseDb.getSettings();
        return data || {
          cafeName: 'OrderChha Restaurant',
          address: 'Kathmandu, Nepal',
          phone: '+977-9800000000',
          logo: 'https://i.ibb.co/6r11CNc/logo.png',
          qrPaymentUrl: ''
        };
      },
      async () => {
        const data = await firebaseDb.getSettings();
        return data || {
          cafeName: 'OrderChha Restaurant',
          address: 'Kathmandu, Nepal',
          phone: '+977-9800000000',
          logo: 'https://i.ibb.co/6r11CNc/logo.png',
          qrPaymentUrl: ''
        };
      },
      () => {
        return {
          cafeName: 'OrderChha Restaurant',
          address: 'Kathmandu, Nepal',
          phone: '+977-9800000000',
          logo: 'https://i.ibb.co/6r11CNc/logo.png',
          qrPaymentUrl: ''
        };
      }
    );
  },
  
  async updateSettings(settings: Settings): Promise<Settings> {
    return withFallback(
      async () => {
        const result = await supabaseDb.updateSettings(settings);
        return result;
      },
      async () => {
        const result = await firebaseDb.updateSettings(settings);
        return result;
      },
      () => {
        console.log('Updating settings in local memory only (will be lost on refresh):', settings);
        return settings;
      }
    );
  },
  
  // Orders operations
  async getKitchenOrders(): Promise<KitchenOrder[]> {
    return withFallback(
      async () => {
        const data = await supabaseDb.getKitchenOrders();
        return data || [];
      },
      async () => {
        const data = await firebaseDb.getKitchenOrders();
        return data || [];
      },
      () => {
        return [];
      }
    );
  },
  
  async placeOrder(tableId: number, items: any[]): Promise<any> {
    return withFallback(
      async () => {
        const result = await supabaseDb.placeOrder(tableId, items);
        return result;
      },
      async () => {
        const result = await firebaseDb.placeOrder(tableId, items);
        return result;
      },
      () => {
        console.log('Placing order in local memory only (will be lost on refresh):', tableId, items);
        return {
          id: `order-${Date.now()}`,
          tableId,
          items,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
      }
    );
  },
  
  async completeKitchenOrder(orderId: string): Promise<any> {
    return withFallback(
      async () => {
        const result = await supabaseDb.completeKitchenOrder(orderId);
        return result;
      },
      async () => {
        const result = await firebaseDb.completeKitchenOrder(orderId);
        return result;
      },
      () => {
        console.log('Completing order in local memory only (will be lost on refresh):', orderId);
        return { id: orderId, status: 'completed' };
      }
    );
  },
  
  // Inventory operations
  async getInventory(): Promise<InventoryItem[]> {
    return withFallback(
      async () => {
        const data = await supabaseDb.getInventory();
        return data || [];
      },
      async () => {
        const data = await firebaseDb.getInventory();
        return data || [];
      },
      () => {
        return [];
      }
    );
  },
  
  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    return withFallback(
      async () => {
        const result = await supabaseDb.updateInventory(itemId, updates);
        return result;
      },
      async () => {
        const result = await firebaseDb.updateInventory(itemId, updates);
        return result;
      },
      () => {
        console.log('Updating inventory item in local memory only (will be lost on refresh):', itemId, updates);
        return { id: itemId, ...updates } as InventoryItem;
      }
    );
  },
  
  // Subscriptions - will use whichever database is active
  subscribeToTables(callback: (payload: any) => void): { unsubscribe: () => void } {
    if (activeDatabase === 'supabase') {
      try {
        return supabaseDb.subscribeToTables(callback);
      } catch (error) {
        console.error('Error subscribing to tables:', error);
        switchToFallback();
      }
    }
    
    if (activeDatabase === 'firebase' && isFirebaseAvailable) {
      try {
        return firebaseDb.subscribeToTables(callback);
      } catch (error) {
        console.error('Error subscribing to tables with Firebase:', error);
        switchToFallback();
      }
    }
    
    // Fallback - just return a dummy unsubscribe function
    console.log('Using dummy subscription for tables (no real-time updates)');
    return { unsubscribe: () => {} };
  },
  
  subscribeToOrders(callback: (payload: any) => void): { unsubscribe: () => void } {
    if (activeDatabase === 'supabase') {
      try {
        return supabaseDb.subscribeToOrders(callback);
      } catch (error) {
        console.error('Error subscribing to orders:', error);
        switchToFallback();
      }
    }
    
    if (activeDatabase === 'firebase' && isFirebaseAvailable) {
      try {
        return firebaseDb.subscribeToOrders(callback);
      } catch (error) {
        console.error('Error subscribing to orders with Firebase:', error);
        switchToFallback();
      }
    }
    
    // Fallback - just return a dummy unsubscribe function
    console.log('Using dummy subscription for orders (no real-time updates)');
    return { unsubscribe: () => {} };
  },
  
  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return withFallback(
      async () => {
        const data = await supabaseDb.getTransactions();
        return data || [];
      },
      async () => {
        const data = await firebaseDb.getTransactions();
        return data || [];
      },
      () => {
        return [];
      }
    );
  },
  
  // Users
  async getUsers(): Promise<User[]> {
    return withFallback(
      async () => {
        const data = await supabaseDb.getUsers();
        return data || [];
      },
      async () => {
        const data = await firebaseDb.getUsers();
        return data || [];
      },
      () => {
        return [{
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          photoURL: 'https://i.ibb.co/6r11CNc/logo.png'
        }];
      }
    );
  },
};
