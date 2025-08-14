
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, onSnapshot, writeBatch, query, deleteDoc as firestoreDeleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { MenuCategory, MenuItem, Table, Settings, OrderItem, KitchenOrder, Transaction, User, UserFormData } from '@/types';
import { MENU as initialMenu, TABLES as initialTables } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

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
  transactions: Transaction[];
  processPayment: (tableId: number, method: 'cash' | 'online') => void;
  currentUser: User | null;
  users: User[];
  addUser: (userData: UserFormData, photoFile: File | null) => Promise<void>;
  updateUserRole: (uid: string, role: 'admin' | 'staff') => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
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

// Create a mock admin user since login is removed
const mockAdminUser: User = {
    uid: 'admin-mock-uid',
    email: 'admin@orderchha.cafe',
    name: 'Admin User',
    role: 'admin',
    joiningDate: new Date().toISOString()
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<KitchenOrder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  
  // No-op for initializeData as we don't need to wait for a user
  useEffect(() => {
    const unsubscribers = [
      onSnapshot(doc(db, 'app-config', 'settings'), async (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as Settings);
        } else {
          await setDoc(docSnap.ref, initialSettings);
          setSettings(initialSettings);
        }
      }),
      onSnapshot(query(collection(db, 'menu')), async (snapshot) => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          initialMenu.forEach(category => {
            const categoryDocRef = doc(db, 'menu', category.id);
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
                const tableDocRef = doc(db, 'tables', table.id.toString());
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
       onSnapshot(query(collection(db, 'users')), (snapshot) => {
        if (snapshot.empty) {
            // If no users exist, create the default admin user.
            const adminUserDocRef = doc(db, 'users', mockAdminUser.uid);
            setDoc(adminUserDocRef, mockAdminUser);
            setUsers([mockAdminUser]);
        } else {
            setUsers(snapshot.docs.map(doc => doc.data() as User));
        }
       }),
    ];

    setOrder(JSON.parse(localStorage.getItem('orderchha-order') || '[]'));
    setIsLoaded(true);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);


  useEffect(() => { 
    if (isLoaded) localStorage.setItem('orderchha-order', JSON.stringify(order)); 
  }, [order, isLoaded]);

  const addMenuItem = async (item: MenuItem, categoryName: string) => {
    const categoryRef = doc(db, 'menu', categoryName);
    const categorySnap = await getDoc(categoryRef);
    if (categorySnap.exists()) {
        const categoryData = categorySnap.data() as MenuCategory;
        const newItems = [...categoryData.items, item];
        await setDoc(categoryRef, { ...categoryData, items: newItems });
    } else {
        const newCategory: MenuCategory = {
            id: categoryName.toLowerCase().replace(/\s/g, '-'),
            name: categoryName,
            icon: 'Utensils',
            items: [item]
        };
        await setDoc(doc(db, 'menu', newCategory.id), newCategory);
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
    
    batch.set(doc(db, 'transactions', newTransaction.id), newTransaction);
    
    ordersToPay.forEach(order => {
        const orderRef = doc(db, 'kitchen-orders', order.id);
        batch.delete(orderRef);
    });

    const tableRef = doc(db, 'tables', tableId.toString());
    batch.update(tableRef, { status: 'available' });

    await batch.commit();
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };
  
  const addUser = async (userData: UserFormData, photoFile: File | null) => {
      // In a real app, this would use Firebase Auth to create a user
      // then save their data to Firestore. Here, we just add to Firestore.
      const uid = `user-${Date.now()}`;
      let photoUrl = 'https://placehold.co/100x100.png';

      if (photoFile) {
          photoUrl = await uploadImage(photoFile, `user-photos/${uid}/${photoFile.name}`);
      }

      const newUser: User = {
          uid,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          mobile: userData.mobile,
          address: userData.address,
          designation: userData.designation,
          joiningDate: userData.joiningDate,
          photoUrl,
      };

      await setDoc(doc(db, 'users', uid), newUser);
      // We don't handle password here as auth is removed.
  };

  const updateUserRole = async (uid: string, role: 'admin' | 'staff') => {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { role }, { merge: true });
  };
  
  const deleteUser = async (uid: string) => {
      // In a real app, this would also delete the user from Firebase Auth.
      const userRef = doc(db, 'users', uid);
      await firestoreDeleteDoc(userRef);
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
    transactions,
    processPayment,
    currentUser: mockAdminUser,
    users,
    addUser,
    updateUserRole,
    deleteUser,
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
