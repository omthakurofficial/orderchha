
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { MenuCategory, MenuItem, Table, Settings, OrderItem, KitchenOrder, Transaction, User, UserRole } from '@/types';
import { MENU as initialMenu, TABLES as initialTables } from '@/lib/data';

interface AppContextType {
  isLoaded: boolean;
  isAuthLoading: boolean;
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
  transactions: Transaction[];
  processPayment: (tableId: number, method: 'cash' | 'online') => void;
  currentUser: User | null;
  signIn: (email:string, password:string) => Promise<any>;
  signUp: (email:string, password:string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialSettings: Settings = {
  cafeName: 'OrderChha',
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<KitchenOrder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Handle Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        if (user) {
            let userRole: UserRole = 'staff'; // Default role
            
            // Special override for the primary admin email
            if (user.email === 'admin@orderchha.com') {
                userRole = 'admin';
            } else {
                 // Check for role in Firestore
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.role) {
                        userRole = userData.role;
                    }
                } else {
                    // If user document doesn't exist, create it with default 'staff' role
                    const newUser: User = {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName || user.email || 'Anonymous',
                        role: 'staff',
                    };
                    await setDoc(userDocRef, newUser);
                }
            }
           
            setCurrentUser({
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email || 'Anonymous User',
                role: userRole,
            });
        } else {
            setCurrentUser(null);
        }
        setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);


  // Load initial state from localStorage on mount
  useEffect(() => {
    setMenu(loadState('orderchha-menu', initialMenu));
    setTables(loadState('orderchha-tables', initialTables));
    setSettings(loadState('orderchha-settings', initialSettings));
    setOrder(loadState('orderchha-order', []));
    setKitchenOrders(loadState('orderchha-kitchen-orders', []));
    setPendingOrders(loadState('orderchha-pending-orders', []));
    setTransactions(loadState('orderchha-transactions', []));
    
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => { if (isLoaded) saveState('orderchha-menu', menu); }, [menu, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('orderchha-tables', tables); }, [tables, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('orderchha-settings', settings); }, [settings, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('orderchha-order', order); }, [order, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('orderchha-kitchen-orders', kitchenOrders); }, [kitchenOrders, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('orderchha-pending-orders', pendingOrders); }, [pendingOrders, isLoaded]);
  useEffect(() => { if (isLoaded) saveState('orderchha-transactions', transactions); }, [transactions, isLoaded]);

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const signOut = () => {
    return firebaseSignOut(auth);
  }

  const addMenuItem = (item: MenuItem, categoryName: string) => {
    setMenu(prevMenu => {
      const newMenu = [...prevMenu];
      const categoryIndex = newMenu.findIndex(cat => cat.name === categoryName);

      if (categoryIndex > -1) {
        newMenu[categoryIndex] = { ...newMenu[categoryIndex], items: [...newMenu[categoryIndex].items, item] };
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
    const order = kitchenOrders.find(o => o.id === orderId);
    if (!order) return;

    setKitchenOrders(prev => prev.map(o => o.id === orderId ? {...o, status: 'completed'} : o));
    updateTableStatus(order.tableId, 'billing');
  }
  
  const approvePendingOrder = (orderId: string) => {
    const orderToApprove = pendingOrders.find(o => o.id === orderId);
    if (!orderToApprove) return;

    // Move from pending to kitchen
    setKitchenOrders(prev => [...prev, {...orderToApprove, status: 'in-kitchen'}]);
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));

    // Update table status
    updateTableStatus(orderToApprove.tableId, 'occupied');
  };

  const rejectPendingOrder = (orderId: string) => {
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const processPayment = (tableId: number, method: 'cash' | 'online') => {
    // Find all completed orders for the table
    const ordersToPay = kitchenOrders.filter(o => o.tableId === tableId && o.status === 'completed');
    if (ordersToPay.length === 0) return;

    const totalAmount = ordersToPay.reduce((acc, order) => acc + order.total, 0);

    const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        tableId,
        amount: totalAmount * 1.13, // Apply VAT
        method,
        timestamp: new Date().toISOString(),
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Remove paid orders from kitchen list
    const orderIdsToPay = ordersToPay.map(o => o.id);
    setKitchenOrders(prev => prev.filter(o => !orderIdsToPay.includes(o.id)));

    // Set table back to available
    updateTableStatus(tableId, 'available');
  };


  const value = { 
    isLoaded,
    isAuthLoading,
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
    transactions,
    processPayment,
    currentUser,
    signIn,
    signOut,
    signUp,
  };

  return (
    <AppContext.Provider value={value}>
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
