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
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  
  // 🔥 TABLE-SPECIFIC CART MANAGEMENT
  currentTableId: number | null;
  setCurrentTableId: (tableId: number | null) => void;
  order: OrderItem[];
  getTableOrder: (tableId: number) => OrderItem[];
  addItemToOrder: (item: MenuItem, tableId: number) => void;
  removeItemFromOrder: (itemId: string, tableId: number) => void;
  updateOrderItemQuantity: (itemId: string, quantity: number, tableId: number) => void;
  clearOrder: (tableId?: number) => void;
  clearTableOrder: (tableId: number) => void;
  placeOrder: (tableId: number) => void;
  kitchenOrders: KitchenOrder[];
  completeKitchenOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: 'preparing' | 'ready' | 'completed') => void;
  pendingOrders: KitchenOrder[];
  approvePendingOrder: (orderId: string) => void;
  rejectPendingOrder: (orderId: string) => void;
  transactions: Transaction[];
  processPayment: (tableId: number, method: 'cash' | 'online', applyVat: boolean) => void;
  clearAllBillingHistory: () => void;
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  users: User[];
  addUser: (userData: UserFormData, photoFile: File | null) => Promise<void>;
  addCustomer: (userData: UserFormData, photoFile: File | null) => Promise<void>;
  updateUserRole: (uid: string, role: User['role']) => Promise<void>;
  updateUserProfile: (userData: Partial<UserFormData>, photoFile: File | null) => Promise<void>;
  updateCustomerCredit: (uid: string, amount: number) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>;
  updateInventoryItemStock: (itemId: string, amount: number) => Promise<void>;
  deleteInventoryItem: (itemId: string) => Promise<void>;
  completedTransactions: Transaction[];
  completeTransaction: (transaction: Transaction) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialSettings: Settings = {
  cafeName: 'Sips & Slices Corner',
  address: '123 Gourmet Street, Foodie City, 98765',
  phone: '(555) 123-4567',
  logo: 'https://i.ibb.co/6r11CNc/logo.png',
  currency: 'INR',
  taxRate: 18,
  serviceCharge: 10,
  receiptNote: 'Thank you for dining with us!',
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
  
  // 🔥 TABLE-SPECIFIC ORDER MANAGEMENT - Prevents cart mixing between customers
  const [currentTableId, setCurrentTableId] = useState<number | null>(null);
  const [tableOrders, setTableOrders] = useState<Record<number, OrderItem[]>>({});
  const [order, setOrder] = useState<OrderItem[]>([]); // Current table's order
  
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

    // 🔥 Load table-specific orders from localStorage
    const savedTableOrders = localStorage.getItem('orderchha-table-orders');
    if (savedTableOrders) {
      try {
        const parsedTableOrders = JSON.parse(savedTableOrders);
        setTableOrders(parsedTableOrders);
      } catch (error) {
        console.log('⚠️ Error loading table orders from localStorage:', error);
        localStorage.removeItem('orderchha-table-orders');
      }
    }

    // Load legacy single order (migrate to table-specific if exists)
    const savedOrder = localStorage.getItem('orderchha-order');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        if (parsedOrder.length > 0) {
          // Migrate to table 1 if no table specified
          const migratedOrders = { 1: parsedOrder };
          setTableOrders(migratedOrders);
          localStorage.setItem('orderchha-table-orders', JSON.stringify(migratedOrders));
          localStorage.removeItem('orderchha-order'); // Remove legacy
          
          toast({
            title: "Cart Migrated",
            description: "Previous order moved to Table 1",
          });
        }
      } catch (error) {
        console.log('⚠️ Error migrating legacy order:', error);
        localStorage.removeItem('orderchha-order');
      }
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
  // Clean in-memory state management - no external database needed for now

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

  // 🔥 TABLE-SPECIFIC ORDER MANAGEMENT - Prevents Multiple Customer Cart Mixing
  const getTableOrder = (tableId: number): OrderItem[] => {
    return tableOrders[tableId] || [];
  };

  const updateTableOrderInStorage = (tableId: number, orderItems: OrderItem[]) => {
    const newTableOrders = { ...tableOrders, [tableId]: orderItems };
    setTableOrders(newTableOrders);
    localStorage.setItem('orderchha-table-orders', JSON.stringify(newTableOrders));
    
    // Update current order if this is the current table
    if (currentTableId === tableId) {
      setOrder(orderItems);
    }
  };

  const addItemToOrder = (item: MenuItem, tableId: number) => {
    const currentTableOrder = getTableOrder(tableId);
    const existingItem = currentTableOrder.find(orderItem => orderItem.id === item.id);
    
    let newOrder: OrderItem[];
    if (existingItem) {
      newOrder = currentTableOrder.map(orderItem => 
        orderItem.id === item.id 
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      );
    } else {
      const newOrderItem: OrderItem = {
        ...item,
        quantity: 1
      };
      newOrder = [...currentTableOrder, newOrderItem];
    }
    
    updateTableOrderInStorage(tableId, newOrder);
    
    toast({
      title: "Item Added",
      description: `${item.name} added to Table ${tableId}`,
    });
  };

  const removeItemFromOrder = (itemId: string, tableId: number) => {
    const currentTableOrder = getTableOrder(tableId);
    const newOrder = currentTableOrder.filter(item => item.id !== itemId);
    updateTableOrderInStorage(tableId, newOrder);
  };

  const updateOrderItemQuantity = (itemId: string, quantity: number, tableId: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId, tableId);
      return;
    }
    
    const currentTableOrder = getTableOrder(tableId);
    const newOrder = currentTableOrder.map(item => 
      item.id === itemId 
        ? { ...item, quantity }
        : item
    );
    updateTableOrderInStorage(tableId, newOrder);
  };

  const clearOrder = (tableId?: number) => {
    if (tableId) {
      // Clear specific table's order
      clearTableOrder(tableId);
    } else {
      // Clear current table's order
      if (currentTableId) {
        clearTableOrder(currentTableId);
      }
    }
  };

  const clearTableOrder = (tableId: number) => {
    const newTableOrders = { ...tableOrders };
    delete newTableOrders[tableId];
    setTableOrders(newTableOrders);
    localStorage.setItem('orderchha-table-orders', JSON.stringify(newTableOrders));
    
    // Update current order if this is the current table
    if (currentTableId === tableId) {
      setOrder([]);
    }

    toast({
      title: "Cart Cleared",
      description: `Table ${tableId} cart has been cleared`,
    });
  };

  // Update current order when table changes
  useEffect(() => {
    if (currentTableId) {
      const tableOrder = getTableOrder(currentTableId);
      setOrder(tableOrder);
    } else {
      setOrder([]);
    }
  }, [currentTableId, tableOrders]);

  const placeOrder = (tableId: number) => {
    const tableOrder = getTableOrder(tableId);
    if (tableOrder.length === 0) {
      toast({
        title: "Empty Cart",
        description: `No items in cart for Table ${tableId}`,
        variant: "destructive"
      });
      return;
    }

    const orderTotal = tableOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = tableOrder.reduce((sum, item) => sum + item.quantity, 0);
    
    const newOrder: KitchenOrder = {
      id: `${Date.now()}-T${tableId}`, // Include table ID in order ID for better tracking
      tableId,
      items: tableOrder, // Use table-specific order items
      status: 'pending',
      timestamp: new Date().toISOString(),
      totalAmount: orderTotal,
      total: orderTotal
    };
    
    setPendingOrders(prev => [...prev, newOrder]);
    updateTableStatus(tableId, 'occupied');
    clearTableOrder(tableId); // Clear only this table's order
    
    toast({
      title: "Order Placed! 🍽️",
      description: `Table ${tableId}: ${itemCount} items (₹${orderTotal}) sent to kitchen.`,
    });

    // Dispatch custom event for notifications
    window.dispatchEvent(new CustomEvent('orderPlaced', {
      detail: { tableId, orderTotal, itemCount, orderId: newOrder.id }
    }));
  };

  const completeKitchenOrder = (orderId: string) => {
    const order = kitchenOrders.find(o => o.id === orderId);
    if (order) {
      setKitchenOrders(prev => prev.filter(o => o.id !== orderId));
      updateTableStatus(order.tableId, 'occupied');
    }
  };

  const updateOrderStatus = (orderId: string, status: 'preparing' | 'ready' | 'completed') => {
    setKitchenOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));

    // Dispatch custom event for notifications
    if (status === 'ready') {
      const order = kitchenOrders.find(o => o.id === orderId);
      if (order) {
        window.dispatchEvent(new CustomEvent('orderReady', {
          detail: { tableId: order.tableId, orderId: order.id }
        }));
      }
    } else if (status === 'completed') {
      const order = kitchenOrders.find(o => o.id === orderId);
      if (order) {
        updateTableStatus(order.tableId, 'billing');
        window.dispatchEvent(new CustomEvent('paymentPending', {
          detail: { tableId: order.tableId, amount: order.totalAmount }
        }));
      }
    }
  };

  const approvePendingOrder = (orderId: string) => {
    const order = pendingOrders.find(o => o.id === orderId);
    if (order) {
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      setKitchenOrders(prev => [...prev, { ...order, status: 'preparing' }]);

      // Dispatch custom event for notifications
      window.dispatchEvent(new CustomEvent('orderConfirmed', {
        detail: { tableId: order.tableId, orderId: order.id }
      }));
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
    // Look for completed orders for this table
    const tableOrders = kitchenOrders.filter(order => 
      order.tableId === tableId && (order.status === 'completed' || order.status === 'ready')
    );
    
    if (tableOrders.length === 0) {
      toast({
        title: "No orders to pay",
        description: `No completed orders found for table ${tableId}.`,
        variant: "destructive"
      });
      return;
    }

    const totalAmount = tableOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
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
    // Remove only the paid orders, not all orders for the table
    setKitchenOrders(prev => prev.filter(order => 
      !(order.tableId === tableId && (order.status === 'completed' || order.status === 'ready'))
    ));
    updateTableStatus(tableId, 'available');

    toast({
      title: "Payment Processed!",
      description: `₹${finalAmount.toFixed(2)} payment completed for table ${tableId}.`,
    });

    // Dispatch custom event for notifications
    window.dispatchEvent(new CustomEvent('orderCompleted', {
      detail: { tableId, amount: finalAmount }
    }));
  };

  const clearAllBillingHistory = () => {
    setTransactions([]);
    setKitchenOrders([]);
    setPendingOrders([]);
    
    // Also reset all tables to available status
    setTables(prev => prev.map(table => ({ ...table, status: 'available' as const })));
    
    // Clear any localStorage data that might be cached
    localStorage.removeItem('orderchha-order');
    localStorage.removeItem('orderchha-transactions');
    localStorage.removeItem('orderchha-billing');
    
    toast({
      title: "✅ Billing History Cleared",
      description: "All transactions, orders, and billing data have been cleared.",
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

  const updateUserProfile = async (userData: Partial<UserFormData>, photoFile: File | null) => {
    try {
      if (currentUser) {
        // Update local user data
        const updatedUser: User = {
          ...currentUser,
          ...userData,
          // Handle photo update - for now just store locally
          ...(photoFile && { photoUrl: URL.createObjectURL(photoFile) })
        };
        setCurrentUser(updatedUser);
        
        // TODO: Implement with real Appwrite user update and photo upload to cloud storage
        console.log('TODO: Implement real user profile update with Appwrite', { userData, photoFile });
        
        // For now, just update locally
        localStorage.setItem('orderchha-current-user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
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

  // Customer management (alias for addUser)
  const addCustomer = async (userData: UserFormData, photoFile: File | null) => {
    const customerData = { ...userData, isCustomer: true };
    await addUser(customerData, photoFile);
  };

  const updateCustomerCredit = async (uid: string, amount: number) => {
    setUsers(prev => prev.map(user => 
      user.uid === uid 
        ? { ...user, creditBalance: (user.creditBalance || 0) + amount }
        : user
    ));
    toast({
      title: "Credit Updated",
      description: `Customer credit balance updated.`,
    });
  };

  // Transaction management
  const completedTransactions = transactions.filter(t => t.id);
  
  const completeTransaction = async (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
    toast({
      title: "Transaction Completed",
      description: `Payment of ₹${transaction.amount} processed.`,
    });
  };

  const value = {
    isLoaded,
    menu,
    addMenuItem,
    tables,
    addTable,
    updateTable,
    updateTableStatus,
    setTables,
    settings,
    updateSettings,
    
    // 🔥 TABLE-SPECIFIC ORDER MANAGEMENT
    currentTableId,
    setCurrentTableId,
    order, // Current table's order
    getTableOrder,
    addItemToOrder,
    removeItemFromOrder,
    updateOrderItemQuantity,
    clearOrder,
    clearTableOrder,
    placeOrder,
    
    kitchenOrders,
    completeKitchenOrder,
    updateOrderStatus,
    pendingOrders,
    approvePendingOrder,
    rejectPendingOrder,
    transactions,
    processPayment,
    clearAllBillingHistory,
    currentUser,
    signIn,
    signOut,
    users,
    addUser,
    addCustomer,
    updateUserRole,
    updateUserProfile,
    updateCustomerCredit,
    deleteUser,
    inventory,
    addInventoryItem,
    updateInventoryItemStock,
    deleteInventoryItem,
    completedTransactions,
    completeTransaction,
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
