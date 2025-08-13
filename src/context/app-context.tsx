
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, writeBatch, query, deleteDoc as firestoreDeleteDoc, serverTimestamp } from 'firebase/firestore';
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
  addStaffUser: (userData: Omit<User, 'uid' | 'role'> & {password: string}) => Promise<any>;
  signOut: () => Promise<any>;
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
        setIsAuthLoading(true);
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setCurrentUser({
                    uid: user.uid,
                    ...userDoc.data()
                } as User);
            } else {
                // This handles the first-time admin creation
                if (user.email === 'admin@orderchha.com') {
                    const adminUser: User = {
                        uid: user.uid,
                        email: user.email,
                        name: 'Admin',
                        role: 'admin',
                        joiningDate: new Date().toISOString(),
                    };
                    await setDoc(userDocRef, adminUser);
                    setCurrentUser(adminUser);
                }
            }
        } else {
            setCurrentUser(null);
        }
        setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const initializeData = useCallback(async (user: User | null) => {
    if (!user) {
        setIsLoaded(true);
        return;
    };

    // Use onSnapshot for real-time updates
    const unsubscribers = [
      onSnapshot(doc(db, 'app-config', 'settings'), async (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as Settings);
        } else {
          await setDoc(doc.ref, initialSettings);
          setSettings(initialSettings);
        }
      }),
      onSnapshot(query(collection(db, 'menu')), async (snapshot) => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          initialMenu.forEach(category => {
            const categoryDocRef = doc(collection(db, 'menu'), category.id);
            batch.set(categoryDocRef, category);
          });
          await batch.commit();
          setMenu(initialMenu);
        } else {
          setMenu(snapshot.docs.map(doc => doc.data() as MenuCategory));
        }
      }),
      onSnapshot(query(collection(db, 'tables')), async (snapshot) => {
        if (snapshot.empty) {
            const batch = writeBatch(db);
            initialTables.forEach(table => {
                const tableDocRef = doc(collection(db, 'tables'), table.id.toString());
                batch.set(tableDocRef, table);
            });
            await batch.commit();
            setTables(initialTables);
        } else {
            setTables(snapshot.docs.map(doc => doc.data() as Table).sort((a,b) => a.id - b.id));
        }
      }),
      onSnapshot(query(collection(db, 'kitchen-orders')), (snapshot) => 
        setKitchenOrders(snapshot.docs.map(doc => doc.data() as KitchenOrder))
      ),
      onSnapshot(query(collection(db, 'pending-orders')), (snapshot) => 
        setPendingOrders(snapshot.docs.map(doc => doc.data() as KitchenOrder))
      ),
      onSnapshot(query(collection(db, 'transactions')), (snapshot) => 
        setTransactions(snapshot.docs.map(doc => doc.data() as Transaction))
      ),
    ];

    setOrder(JSON.parse(localStorage.getItem('orderchha-order') || '[]'));
    setIsLoaded(true);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      const cleanup = initializeData(currentUser);
      return () => {
        if (typeof cleanup === 'function') {
           // This will be a function if the user was logged in
           cleanup();
        }
      }
    }
  }, [isAuthLoading, currentUser, initializeData]);

  // Save order to localStorage only
  useEffect(() => { 
    if (isLoaded) localStorage.setItem('orderchha-order', JSON.stringify(order)); 
  }, [order, isLoaded]);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  const addStaffUser = async (userData: Omit<User, 'uid' | 'role'> & {password: string}) => {
    // This is a temporary auth instance to create the user without signing in the admin out
    const tempApp = initializeApp(auth.app.options, `temp-app-${Date.now()}`);
    const tempAuth = getAuth(tempApp);
    
    const userCredential = await createUserWithEmailAndPassword(tempAuth, userData.email!, userData.password);
    const user = userCredential.user;
    
    const newUser: User = {
        uid: user.uid,
        email: userData.email,
        name: userData.name,
        role: 'staff',
        photoUrl: userData.photoUrl,
        mobile: userData.mobile,
        address: userData.address,
        designation: userData.designation,
        joiningDate: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', user.uid), newUser);
    // No need to setCurrentUser as the admin is still logged in
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
    }
  };

  const addTable = async (capacity: number) => {
    const newTableId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
    const newTable: Table = {
      id: newTableId,
      capacity,
      status: 'available'
    };
    await setDoc(doc(db, 'tables', newTable.id.toString()), newTable);
  };

  const updateTableStatus = async (tableId: number, status: Table['status']) => {
    const tableDocRef = doc(db, 'tables', tableId.toString());
    await setDoc(tableDocRef, { status }, { merge: true });
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const settingsDocRef = doc(db, 'app-config', 'settings');
    await setDoc(settingsDocRef, newSettings, { merge: true });
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
  };

  const rejectPendingOrder = async (orderId: string) => {
    await firestoreDeleteDoc(doc(db, 'pending-orders', orderId));
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
    addStaffUser,
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
