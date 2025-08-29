// SUPABASE REAL-TIME APP CONTEXT
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { auth } from '@/lib/appwrite'; // Keep Appwrite for authentication
import { db, supabase } from '@/lib/supabase'; // Use Supabase for data
import type { MenuCategory, MenuItem, Table, Settings, OrderItem, KitchenOrder, Transaction, User, UserFormData, InventoryItem, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  isLoaded: boolean;
  menu: MenuCategory[];
  addMenuItem: (item: MenuItem, categoryName: string) => void;
  tables: Table[];
  addTable: (tableData: Omit<Table, 'id' | 'status'>) => void;
  updateTable: (tableId: number, tableData: Partial<Omit<Table, 'id'>>) => void;
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
  inventory: InventoryItem[];
  updateInventory: (itemId: string, updates: Partial<InventoryItem>) => void;
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (itemId: string) => void;
  currentUser: User | null;
  users: User[];
  addUser: (userData: UserFormData) => void;
  removeUser: (userId: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completedTransactions: Transaction[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialSettings: Settings = {
  cafeName: 'OrderChha Restaurant',
  address: 'Kathmandu, Nepal',
  phone: '+977-9800000000',
  logo: 'https://i.ibb.co/6r11CNc/logo.png',
  aiSuggestionsEnabled: true,
  onlineOrderingEnabled: true,
  paymentQrUrl: 'https://www.example.com/pay',
  currency: 'NPR',
  taxRate: 0.13,
  serviceCharge: 0.10,
  receiptNote: 'Thank you for dining with us!',
};

export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<KitchenOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Load data from Supabase
  const loadDataFromSupabase = useCallback(async () => {
    try {
      console.log('🔄 Loading data from Supabase...');

      // Check if user is already logged in with Appwrite
      try {
        const user = await auth.getCurrentUser();
        if (user) {
          const currentUserData = {
            uid: user.$id,
            name: user.name,
            email: user.email,
            role: 'admin' as UserRole, // Default role, you can enhance this later
          };
          setCurrentUser(currentUserData);
          // Also add to users list for the users page
          setUsers([currentUserData]);
          console.log('✅ User already logged in:', user.name);
        }
      } catch (authError) {
        console.log('ℹ️ No user session found');
        setCurrentUser(null);
        setUsers([]);
      }

      // Load Menu - Transform Supabase data to app format
      try {
        console.log('📋 Loading menu data...');
        const menuData = await db.getMenu();
        console.log('📋 Menu raw data:', menuData);
        
        if (!menuData || menuData.length === 0) {
          console.log('⚠️ No menu data found, creating default data...');
          setMenu([]);
        } else {
          const transformedMenu = menuData?.map(category => ({
            id: category.id,
            name: category.name,
            icon: category.icon,
            items: category.menu_items.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              imageHint: item.image_hint,
              inStock: item.in_stock,
            }))
          })) || [];
          setMenu(transformedMenu);
          console.log('✅ Menu loaded:', transformedMenu.length, 'categories');
        }
      } catch (menuError) {
        console.error('❌ Menu loading failed:', menuError);
        setMenu([]);
      }

      // Load Tables
      try {
        const tablesData = await db.getTables();
        setTables(tablesData || []);
        console.log('✅ Tables loaded:', tablesData?.length || 0, 'tables');
      } catch (tablesError) {
        console.error('❌ Tables loading failed:', tablesError);
        setTables([]);
      }

      // Load Settings
      try {
        const settingsData = await db.getSettings();
        if (settingsData) {
          setSettings({
            cafeName: settingsData.cafe_name,
            address: settingsData.address,
            phone: settingsData.phone,
            logo: settingsData.logo,
            currency: settingsData.currency,
            taxRate: settingsData.tax_rate,
            serviceCharge: settingsData.service_charge,
            receiptNote: settingsData.receipt_note,
            aiSuggestionsEnabled: settingsData.ai_suggestions_enabled,
            onlineOrderingEnabled: settingsData.online_ordering_enabled,
            paymentQrUrl: settingsData.payment_qr_url,
          });
          console.log('✅ Settings loaded');
        }
      } catch (settingsError) {
        console.error('❌ Settings loading failed:', settingsError);
        // Keep default settings
      }

      // Load Kitchen Orders - Transform Supabase data to app format
      try {
        const ordersData = await db.getKitchenOrders();
        const transformedOrders = ordersData?.map(order => ({
          id: order.id,
          tableId: order.table_id,
          status: order.status,
          timestamp: order.created_at,
          totalAmount: order.total_amount,
          items: order.order_items.map(item => ({
            id: item.menu_item_id,
            name: item.menu_items[0]?.name || 'Unknown Item',
            description: '',
            price: item.price,
            image: item.menu_items[0]?.image || '',
            imageHint: '',
            inStock: true,
            quantity: item.quantity,
          }))
        })) || [];
        setKitchenOrders(transformedOrders);
        console.log('✅ Orders loaded:', transformedOrders.length, 'orders');
      } catch (ordersError) {
        console.error('❌ Orders loading failed:', ordersError);
        setKitchenOrders([]);
      }

      // Load Inventory - TEMPORARILY DISABLED FOR DEBUGGING
      try {
        const inventoryData = await db.getInventory();
        setInventory(inventoryData || []);
        console.log('✅ Inventory loaded:', inventoryData?.length || 0, 'items');
      } catch (inventoryError) {
        console.warn('⚠️ Inventory loading failed, continuing without inventory:', inventoryError);
        setInventory([]);
      }

      setIsLoaded(true);
      console.log('🎉 Data loading completed successfully!');
      toast({
        title: '🎉 Database Connected',
        description: 'Real-time data loaded from Supabase successfully!',
      });

    } catch (error) {
      console.error('❌ Critical error during data loading:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      setIsLoaded(true); // Still set loaded to true to prevent infinite loading
      toast({
        title: '⚠️ Partial Database Connection',
        description: 'Some data may not be available. Please refresh if needed.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Set up real-time subscriptions
  const setupRealtimeSubscriptions = useCallback(() => {
    // Subscribe to table changes
    const tablesSubscription = db.subscribeToTables((payload) => {
      console.log('🔄 Table update:', payload);
      if (payload.eventType === 'UPDATE') {
        setTables(prev => prev.map(table => 
          table.id === payload.new.id ? { ...table, ...payload.new } : table
        ));
      }
    });

    // Subscribe to order changes
    const ordersSubscription = db.subscribeToOrders((payload) => {
      console.log('🔄 Order update:', payload);
      loadDataFromSupabase(); // Refresh orders when they change
    });

    return () => {
      tablesSubscription.unsubscribe();
      ordersSubscription.unsubscribe();
    };
  }, [loadDataFromSupabase]);

  // Initialize on mount
  useEffect(() => {
    loadDataFromSupabase();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, [loadDataFromSupabase, setupRealtimeSubscriptions]);

  // Menu Management
  const addMenuItem = useCallback(async (item: MenuItem, categoryName: string) => {
    try {
      const category = menu.find(cat => cat.name === categoryName);
      if (!category) return;

      const newItem = await db.addMenuItem(category.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        image_hint: item.imageHint,
        in_stock: item.inStock,
      });

      setMenu(prev => prev.map(cat => 
        cat.name === categoryName 
          ? { ...cat, items: [...cat.items, { ...item, id: newItem.id }] }
          : cat
      ));

      toast({
        title: '✅ Item Added',
        description: `${item.name} has been added to the menu.`,
      });
    } catch (error) {
      console.error('Failed to add menu item:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to add menu item.',
        variant: 'destructive',
      });
    }
  }, [menu, toast]);

  // Table Management
  const updateTableStatus = useCallback(async (tableId: number, status: Table['status']) => {
    try {
      await db.updateTableStatus(tableId, status);
      setTables(prev => prev.map(table => 
        table.id === tableId ? { ...table, status } : table
      ));

      toast({
        title: '✅ Table Updated',
        description: `Table ${tableId} status changed to ${status}.`,
      });
    } catch (error) {
      console.error('Failed to update table:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to update table status.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Order Management
  const addItemToOrder = useCallback((item: MenuItem) => {
    setOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.id === item.id);
      if (existingItem) {
        return prevOrder.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        return [...prevOrder, { ...item, quantity: 1 }];
      }
    });
  }, []);

  const removeItemFromOrder = useCallback((itemId: string) => {
    setOrder(prevOrder => prevOrder.filter(item => item.id !== itemId));
  }, []);

  const updateOrderItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }
    setOrder(prevOrder =>
      prevOrder.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeItemFromOrder]);

  const clearOrder = useCallback(() => {
    setOrder([]);
  }, []);

  const placeOrder = useCallback(async (tableId: number) => {
    try {
      const totalAmount = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const orderData = {
        table_id: tableId,
        total_amount: totalAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const newOrder = await db.createOrder(orderData);
      
      // Add to kitchen orders
      const kitchenOrder: KitchenOrder = {
        id: newOrder.id,
        tableId,
        items: order,
        status: 'pending',
        timestamp: new Date().toISOString(),
        totalAmount,
      };

      setKitchenOrders(prev => [...prev, kitchenOrder]);
      clearOrder();
      await updateTableStatus(tableId, 'occupied');

      toast({
        title: '✅ Order Placed',
        description: `Order placed for Table ${tableId}`,
      });
    } catch (error) {
      console.error('Failed to place order:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to place order.',
        variant: 'destructive',
      });
    }
  }, [order, toast, clearOrder, updateTableStatus]);

  // Placeholder implementations for other functions
  const addTable = useCallback((tableData: Omit<Table, 'id' | 'status'>) => {
    // Implementation needed
  }, []);

  const updateTable = useCallback((tableId: number, tableData: Partial<Omit<Table, 'id'>>) => {
    // Implementation needed
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const completeKitchenOrder = useCallback((orderId: string) => {
    // Implementation needed
  }, []);

  const approvePendingOrder = useCallback((orderId: string) => {
    // Implementation needed
  }, []);

  const rejectPendingOrder = useCallback((orderId: string) => {
    // Implementation needed
  }, []);

  const updateInventory = useCallback((itemId: string, updates: Partial<InventoryItem>) => {
    // Implementation needed
  }, []);

  const addInventoryItem = useCallback((item: InventoryItem) => {
    // Implementation needed
  }, []);

  const removeInventoryItem = useCallback((itemId: string) => {
    // Implementation needed
  }, []);

  const addUser = useCallback((userData: UserFormData) => {
    // Implementation needed
  }, []);

  const removeUser = useCallback((userId: string) => {
    // Implementation needed
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in with Appwrite...');
      const session = await auth.signIn(email, password);
      console.log('✅ Appwrite sign in successful:', session);
      
      // Get user details from Appwrite
      const user = await auth.getCurrentUser();
      if (user) {
        const newUser = {
          uid: user.$id,
          name: user.name,
          email: user.email,
          role: 'admin' as UserRole, // Default role, you can enhance this later
        };
        setCurrentUser(newUser);
        // Also add to users list for the users page
        setUsers([newUser]);
        console.log('✅ User set:', user.name);
      }
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      await auth.signOut();
      setCurrentUser(null);
      setUsers([]);
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Still clear local state even if logout fails
      setCurrentUser(null);
      setUsers([]);
    }
  }, []);

  const contextValue = {
    isLoaded,
    menu,
    addMenuItem,
    tables,
    addTable,
    updateTable,
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
    inventory,
    updateInventory,
    addInventoryItem,
    removeInventoryItem,
    currentUser,
    users,
    addUser,
    removeUser,
    signIn,
    logout,
    completedTransactions,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {initError ? (
        <div className="flex items-center justify-center h-screen bg-red-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Initialization Error</h1>
            <p className="text-red-800 mb-4">{initError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload App
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    console.error('useApp called outside of AppProvider. Component stack:', new Error().stack);
    throw new Error('useApp must be used within an AppProvider. Check that your component is wrapped in <AppProvider>.');
  }
  return context;
};
