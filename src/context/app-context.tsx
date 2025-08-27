// HYBRID MIGRATION: Real Appwrite Auth + Simplified Data Management
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { auth } from '@/lib/appwrite';
import type { MenuCategory, MenuItem, Table, Settings, OrderItem, KitchenOrder, Transaction, User, UserFormData, InventoryItem } from '@/types';
import { MENU as initialMenu, TABLES as initialTables } from '@/lib/data';
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
  transactions: Transaction[];
  processPayment: (tableId: number, method: 'cash' | 'online', applyVat: boolean) => void;
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  users: User[];
  addUser: (userData: UserFormData, photoFile: File | null) => Promise<void>;
  updateUserRole: (uid: string, role: User['role']) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>;
  updateInventoryItemStock: (itemId: string, amount: number) => Promise<void>;
  deleteInventoryItem: (itemId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialSettings: Settings = {
  cafeName: 'Sips & Slices Corner',
  address: '123 Gourmet Street, Foodie City, 98765',
  phone: '(555) 123-4567',
  logo: 'https://i.ibb.co/6r11CNc/logo.png',
  aiSuggestionsEnabled: true,
  onlineOrderingEnabled: true,
  paymentQrUrl: 'https://www.example.com/pay',
};

const initialAdminUser: User = {
  uid: 'appwrite-admin-001',
  email: 'admin@orderchha.cafe',
  name: 'Admin',
  role: 'admin',
  designation: 'Super Admin',
  joiningDate: new Date().toISOString(),
  photoUrl: 'https://placehold.co/100x100.png',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [menu, setMenu] = useState<MenuCategory[]>(initialMenu);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<KitchenOrder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([initialAdminUser]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Initialize with real Appwrite auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Starting with clean Appwrite session...');
        
        // Nuclear option: Clear ALL sessions to ensure clean state
        await auth.clearAllSessions();
        
        // Now we should definitely have no user
        setCurrentUser(null);
        
        toast({
          title: "🔄 Ready to Sign In",
          description: "App initialized with clean session",
        });
        
      } catch (error: any) {
        console.log('⚠️ Error during initialization:', error);
        setCurrentUser(null);
        
        toast({
          title: "ℹ️ Please Sign In",
          description: "Ready for authentication",
        });
      } finally {
        setIsLoaded(true);
      }
    };

    initializeAuth();

    // Load order from localStorage
    const savedOrder = localStorage.getItem('orderchha-order');
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, [toast]);

  // Real Appwrite sign in
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Signing in with Appwrite...');
      const session = await auth.signIn(email, password);
      const user = await auth.getCurrentUser();
      
      if (user) {
        const userData: User = {
          uid: user.$id,
          email: user.email,
          name: user.name || 'User',
          role: user.email === 'admin@orderchha.cafe' ? 'admin' : 'staff',
          designation: user.email === 'admin@orderchha.cafe' ? 'Super Admin' : 'Staff',
          joiningDate: user.$createdAt,
          photoUrl: 'https://placehold.co/100x100.png',
        };
        
        setCurrentUser(userData);
        console.log('✅ Appwrite sign in successful:', user.email);
        
        toast({
          title: "✅ Sign In Successful!",
          description: `Welcome, ${user.name || user.email}`,
        });
      }
    } catch (error: any) {
      console.error('❌ Appwrite sign in failed:', error);
      toast({
        title: "❌ Sign In Failed",
        description: error.message || "Please check your credentials",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Smart sign out (handles both real Appwrite users and demo mode)
  const signOut = async () => {
    try {
      console.log('🔄 Signing out...');
      
      // Check if user is actually signed in to Appwrite
      const currentAppwriteUser = await auth.getCurrentUser();
      
      if (currentAppwriteUser) {
        // Real Appwrite user - sign out from Appwrite
        console.log('🔄 Signing out from Appwrite...');
        await auth.signOut();
        console.log('✅ Appwrite sign out successful');
      } else {
        // Demo mode user - just local sign out
        console.log('ℹ️ Signing out from demo mode');
      }
      
      // Actually sign out - set user to null
      setCurrentUser(null);
      
      toast({
        title: "✅ Signed Out",
        description: "You've been signed out successfully",
      });
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      
      // Even if Appwrite sign out fails, we can still do local sign out
      setCurrentUser(null);
      
      toast({
        title: "✅ Signed Out",
        description: "You've been signed out successfully",
      });
    }
  };

  // Rest of the functions remain the same for now (using local state)
  // We'll migrate these to MongoDB later

  const addMenuItem = (item: MenuItem, categoryName: string) => {
    const newItem = { ...item, id: Date.now().toString() };
    setMenu(prevMenu =>
      prevMenu.map(category => 
        category.name === categoryName
          ? { ...category, items: [...category.items, newItem] }
          : category
      )
    );
  };

  const addTable = (tableData: Omit<Table, 'id' | 'status'>) => {
    const newTable: Table = {
      ...tableData,
      id: Math.max(...tables.map(t => t.id)) + 1,
      status: 'available'
    };
    setTables(prev => [...prev, newTable]);
  };

  const updateTable = (tableId: number, tableData: Partial<Omit<Table, 'id'>>) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, ...tableData } : table
    ));
  };

  const updateTableStatus = (tableId: number, status: Table['status']) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, status } : table
    ));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addItemToOrder = (item: MenuItem) => {
    const existingItem = order.find(orderItem => orderItem.id === item.id);
    if (existingItem) {
      updateOrderItemQuantity(item.id, existingItem.quantity + 1);
    } else {
      const newOrderItem: OrderItem = {
        ...item,
        quantity: 1
      };
      const newOrder = [...order, newOrderItem];
      setOrder(newOrder);
      localStorage.setItem('orderchha-order', JSON.stringify(newOrder));
    }
  };

  const removeItemFromOrder = (itemId: string) => {
    const newOrder = order.filter(item => item.id !== itemId);
    setOrder(newOrder);
    localStorage.setItem('orderchha-order', JSON.stringify(newOrder));
  };

  const updateOrderItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }
    
    const newOrder = order.map(item => 
      item.id === itemId 
        ? { ...item, quantity }
        : item
    );
    setOrder(newOrder);
    localStorage.setItem('orderchha-order', JSON.stringify(newOrder));
  };

  const clearOrder = () => {
    setOrder([]);
    localStorage.removeItem('orderchha-order');
  };

  const placeOrder = (tableId: number) => {
    const orderTotal = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder: KitchenOrder = {
      id: Date.now().toString(),
      tableId,
      items: order,
      status: 'pending',
      timestamp: new Date().toISOString(),
      total: orderTotal
    };
    
    setPendingOrders(prev => [...prev, newOrder]);
    updateTableStatus(tableId, 'occupied');
    clearOrder();
    
    toast({
      title: "Order Placed!",
      description: `Order for table ${tableId} has been sent to kitchen.`,
    });
  };

  const completeKitchenOrder = (orderId: string) => {
    const order = kitchenOrders.find(o => o.id === orderId);
    if (order) {
      setKitchenOrders(prev => prev.filter(o => o.id !== orderId));
      updateTableStatus(order.tableId, 'occupied');
    }
  };

  const approvePendingOrder = (orderId: string) => {
    const order = pendingOrders.find(o => o.id === orderId);
    if (order) {
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      setKitchenOrders(prev => [...prev, { ...order, status: 'in-kitchen' }]);
    }
  };

  const rejectPendingOrder = (orderId: string) => {
    const order = pendingOrders.find(o => o.id === orderId);
    if (order) {
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      updateTableStatus(order.tableId, 'available');
    }
  };

  const processPayment = (tableId: number, method: 'cash' | 'online', applyVat: boolean) => {
    const tableOrders = kitchenOrders.filter(order => order.tableId === tableId);
    const totalAmount = tableOrders.reduce((sum, order) => sum + order.total, 0);
    const vatAmount = applyVat ? totalAmount * 0.1 : 0;
    const finalAmount = totalAmount + vatAmount;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      tableId,
      amount: finalAmount,
      method,
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => [...prev, newTransaction]);
    setKitchenOrders(prev => prev.filter(order => order.tableId !== tableId));
    updateTableStatus(tableId, 'available');

    toast({
      title: "Payment Processed!",
      description: `₹${finalAmount.toFixed(2)} payment completed for table ${tableId}.`,
    });
  };

  // User management (simplified for now)
  const addUser = async (userData: UserFormData, photoFile: File | null) => {
    // TODO: Implement with real Appwrite user creation
    console.log('TODO: Implement real user creation with Appwrite');
  };

  const updateUserRole = async (uid: string, role: User['role']) => {
    // TODO: Implement with real Appwrite user update
    console.log('TODO: Implement real user role update');
  };

  const deleteUser = async (uid: string) => {
    // TODO: Implement with real Appwrite user deletion
    console.log('TODO: Implement real user deletion');
  };

  // Inventory management (simplified for now)
  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString()
    };
    setInventory(prev => [...prev, newItem]);
  };

  const updateInventoryItemStock = async (itemId: string, amount: number) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, stock: Math.max(0, item.stock + amount), lastUpdated: new Date().toISOString() }
        : item
    ));
  };

  const deleteInventoryItem = async (itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };

  const value = {
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
    transactions,
    processPayment,
    currentUser,
    signIn,
    signOut,
    users,
    addUser,
    updateUserRole,
    deleteUser,
    inventory,
    addInventoryItem,
    updateInventoryItemStock,
    deleteInventoryItem,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
