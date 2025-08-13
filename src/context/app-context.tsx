
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch, query, deleteDoc } from 'firebase/firestore';
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
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setCurrentUser({
                    uid: user.uid,
                    ...userDoc.data()
                } as User);
            }
            // If the user doc doesn't exist, it will be created on sign-up.
            // This handles the case where a user is already logged in from a previous session.
        } else {
            setCurrentUser(null);
        }
        setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);


  // Initialize data from Firestore or seed if empty
  const initializeData = useCallback(async () => {
    // Settings
    const settingsDocRef = doc(db, 'app-config', 'settings');
    const settingsDoc = await getDoc(settingsDocRef);
    if (settingsDoc.exists()) {
      setSettings(settingsDoc.data() as Settings);
    } else {
      await setDoc(settingsDocRef, initialSettings);
      setSettings(initialSettings);
    }

    // Menu
    const menuCollection = collection(db, 'menu');
    const menuSnapshot = await getDocs(query(menuCollection));
    if (menuSnapshot.empty) {
      const batch = writeBatch(db);
      initialMenu.forEach(category => {
        const categoryDocRef = doc(menuCollection, category.id);
        batch.set(categoryDocRef, category);
      });
      await batch.commit();
      setMenu(initialMenu);
    } else {
      const menuData = menuSnapshot.docs.map(doc => doc.data() as MenuCategory);
      setMenu(menuData);
    }

    // Tables
    const tablesCollection = collection(db, 'tables');
    const tablesSnapshot = await getDocs(query(tablesCollection));
    if (tablesSnapshot.empty) {
        const batch = writeBatch(db);
        initialTables.forEach(table => {
            const tableDocRef = doc(tablesCollection, table.id.toString());
            batch.set(tableDocRef, table);
        });
        await batch.commit();
        setTables(initialTables);
    } else {
        const tablesData = tablesSnapshot.docs.map(doc => doc.data() as Table).sort((a,b) => a.id - b.id);
        setTables(tablesData);
    }
    
    // Load orders and transactions - it's okay if these are empty
    const kitchenOrdersCollection = collection(db, 'kitchen-orders');
    const kitchenOrdersSnapshot = await getDocs(query(kitchenOrdersCollection));
    setKitchenOrders(kitchenOrdersSnapshot.docs.map(doc => doc.data() as KitchenOrder));
    
    const pendingOrdersCollection = collection(db, 'pending-orders');
    const pendingOrdersSnapshot = await getDocs(query(pendingOrdersCollection));
    setPendingOrders(pendingOrdersSnapshot.docs.map(doc => doc.data() as KitchenOrder));

    const transactionsCollection = collection(db, 'transactions');
    const transactionsSnapshot = await getDocs(query(transactionsCollection));
    setTransactions(transactionsSnapshot.docs.map(doc => doc.data() as Transaction));
    
    setOrder(JSON.parse(localStorage.getItem('orderchha-order') || '[]'));


    setIsLoaded(true);
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Save order to localStorage only
  useEffect(() => { 
    if (isLoaded) localStorage.setItem('orderchha-order', JSON.stringify(order)); 
  }, [order, isLoaded]);

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Determine role. Special case for the first admin.
    const userRole: UserRole = email === 'admin@orderchha.com' ? 'admin' : 'staff';
    
    const newUser: User = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email || 'Anonymous',
        role: userRole,
    };

    // Create the user document in Firestore
    await setDoc(doc(db, 'users', user.uid), newUser);
    
    // Manually set current user in state since onAuthStateChanged might be slow
    setCurrentUser(newUser);

    return userCredential;
  }

  const signOut = () => {
    return firebaseSignOut(auth);
  }

  const addMenuItem = async (item: MenuItem, categoryName: string) => {
    const categoryDocRef = doc(db, 'menu', categoryName);
    const categoryDoc = await getDoc(categoryDocRef);
    if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data() as MenuCategory;
        const updatedItems = [...categoryData.items, item];
        await setDoc(categoryDocRef, { ...categoryData, items: updatedItems });
        setMenu(prevMenu => prevMenu.map(cat => cat.id === categoryName ? { ...cat, items: updatedItems } : cat));
    }
  };

  const addTable = async (capacity: number) => {
    const tablesCollection = collection(db, 'tables');
    const newTableId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
    const newTable: Table = {
      id: newTableId,
      capacity,
      status: 'available'
    };
    await setDoc(doc(tablesCollection, newTable.id.toString()), newTable);
    setTables(prevTables => [...prevTables, newTable]);
  };

  const updateTableStatus = async (tableId: number, status: Table['status']) => {
    const tableDocRef = doc(db, 'tables', tableId.toString());
    await setDoc(tableDocRef, { status }, { merge: true });
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId ? { ...table, status } : table
      )
    );
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const settingsDocRef = doc(db, 'app-config', 'settings');
    await setDoc(settingsDocRef, newSettings, { merge: true });
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

  const placeOrder = async (tableId: number) => {
    if (order.length === 0) return;

    const newPendingOrder: KitchenOrder = {
        id: `order-${Date.now()}`,
        tableId,
        items: [...order],
        status: 'pending',
        timestamp: new Date().toISOString(),
        total: order.reduce((acc, item) => acc + item.price * item.quantity, 0)
    };
    
    await setDoc(doc(db, 'pending-orders', newPendingOrder.id), newPendingOrder);
    setPendingOrders(prev => [...prev, newPendingOrder]);
    clearOrder();
  }
  
  const completeKitchenOrder = async (orderId: string) => {
    const order = kitchenOrders.find(o => o.id === orderId);
    if (!order) return;

    const batch = writeBatch(db);
    const kitchenOrderRef = doc(db, 'kitchen-orders', orderId);
    batch.update(kitchenOrderRef, { status: 'completed' });
    
    const tableRef = doc(db, 'tables', order.tableId.toString());
    batch.update(tableRef, { status: 'billing' });

    await batch.commit();

    setKitchenOrders(prev => prev.map(o => o.id === orderId ? {...o, status: 'completed'} : o));
    updateTableStatus(order.tableId, 'billing');
  }
  
  const approvePendingOrder = async (orderId: string) => {
    const orderToApprove = pendingOrders.find(o => o.id === orderId);
    if (!orderToApprove) return;

    const batch = writeBatch(db);
    const pendingOrderRef = doc(db, 'pending-orders', orderId);
    batch.delete(pendingOrderRef);

    const kitchenOrderRef = doc(db, 'kitchen-orders', orderId);
    const newKitchenOrder = {...orderToApprove, status: 'in-kitchen' as const};
    batch.set(kitchenOrderRef, newKitchenOrder);
    
    const tableRef = doc(db, 'tables', orderToApprove.tableId.toString());
    batch.update(tableRef, { status: 'occupied' });
    
    await batch.commit();

    setKitchenOrders(prev => [...prev, newKitchenOrder]);
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
    setTables(prev => prev.map(t => t.id === orderToApprove.tableId ? {...t, status: 'occupied'} : t));
  };

  const rejectPendingOrder = async (orderId: string) => {
    await deleteDoc(doc(db, 'pending-orders', orderId));
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const processPayment = async (tableId: number, method: 'cash' | 'online') => {
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

    const batch = writeBatch(db);
    
    // Add transaction
    batch.set(doc(db, 'transactions', newTransaction.id), newTransaction);
    
    // Remove paid orders from kitchen list
    ordersToPay.forEach(order => {
        const orderRef = doc(db, 'kitchen-orders', order.id);
        batch.delete(orderRef);
    });

    // Set table back to available
    const tableRef = doc(db, 'tables', tableId.toString());
    batch.update(tableRef, { status: 'available' });

    await batch.commit();

    setTransactions(prev => [...prev, newTransaction]);
    const orderIdsToPay = ordersToPay.map(o => o.id);
    setKitchenOrders(prev => prev.filter(o => !orderIdsToPay.includes(o.id)));
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

    