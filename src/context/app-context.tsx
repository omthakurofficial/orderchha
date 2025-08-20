

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, onSnapshot, writeBatch, query, deleteDoc as firestoreDeleteDoc, getDocs, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseAuthUser } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { MenuCategory, MenuItem, Table, Settings, OrderItem, KitchenOrder, Transaction, User, UserFormData, InventoryItem } from '@/types';
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
    uid: 'lsg4BNvGAre9YZXGBaMonuAQR3h2',
    email: 'admin@orderchha.cafe',
    name: 'Admin',
    role: 'admin',
    designation: 'Super Admin',
    joiningDate: new Date().toISOString(),
    photoUrl: 'https://placehold.co/100x100.png',
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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  const initializeDataForUser = useCallback(async (user: User) => {
    // If the user is the hardcoded admin, use the initialAdminUser object directly.
    // This guarantees access even if the Firestore doc is momentarily out of sync.
    const userToSet = user.uid === initialAdminUser.uid ? initialAdminUser : user;
    setCurrentUser(userToSet);

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
            setUsers(snapshot.docs.map(doc => doc.data() as User));
       }),
       onSnapshot(query(collection(db, 'inventory')), (snapshot) => {
            setInventory(snapshot.docs.map(doc => doc.data() as InventoryItem));
       }),
    ];
    setOrder(JSON.parse(localStorage.getItem('orderchha-order') || '[]'));
    setIsLoaded(true);
    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const clearAppData = () => {
    setCurrentUser(null);
    setMenu([]);
    setTables([]);
    setKitchenOrders([]);
    setPendingOrders([]);
    setTransactions([]);
    setUsers([]);
    clearOrder();
    setIsLoaded(true);
  }
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        // If it's the admin user, directly use the hardcoded admin object.
        if (firebaseUser.uid === initialAdminUser.uid) {
            await initializeDataForUser(initialAdminUser);
            return;
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            await initializeDataForUser(userDocSnap.data() as User);
        } else {
            console.warn(`No Firestore document found for user ${firebaseUser.uid}. Logging out.`);
            await signOut(auth);
        }
      } else {
        clearAppData();
      }
    });

    const ensureAdminExists = async () => {
      const adminDocRef = doc(db, 'users', initialAdminUser.uid);
      const docSnap = await getDoc(adminDocRef);
      if (!docSnap.exists()) {
        console.log("Admin user not found in Firestore. Creating now.");
        await setDoc(adminDocRef, initialAdminUser);
      }
    };

    ensureAdminExists();

    return () => unsubscribe();
  }, [initializeDataForUser]);


  useEffect(() => { 
    if (isLoaded) localStorage.setItem('orderchha-order', JSON.stringify(order)); 
  }, [order, isLoaded]);
  
  const signIn = async (email: string, password: string) => {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
  };
  
  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
  }

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

  const processPayment = async (tableId: number, method: 'cash' | 'online', applyVat: boolean) => {
    const ordersToPay = kitchenOrders.filter(o => o.tableId === tableId && o.status === 'completed');
    if (ordersToPay.length === 0) return;

    const subtotal = ordersToPay.reduce((acc, order) => acc + order.total, 0);
    const totalAmount = applyVat ? subtotal * 1.13 : subtotal;

    const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        tableId,
        amount: totalAmount,
        method,
        timestamp: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    
    batch.set(doc(db, 'transactions', newTransaction.id), newTransaction);
    
    ordersToPay.forEach(order => {
        const orderRef = doc(db, 'kitchen-orders', order.id);
        batch.update(orderRef, { status: 'paid' });
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
      const auth = getAuth();
      if (!userData.password) throw new Error("Password is required to create a user.");
      
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;
      
      let photoUrl = 'https://placehold.co/100x100.png';

      if (photoFile) {
          photoUrl = await uploadImage(photoFile, `user-photos/${user.uid}/${photoFile.name}`);
      }

      const newUser: User = {
          uid: user.uid,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          mobile: userData.mobile,
          address: userData.address,
          designation: userData.designation,
          joiningDate: userData.joiningDate,
          photoUrl,
      };

      await setDoc(doc(db, 'users', user.uid), newUser);
  };

  const updateUserRole = async (uid: string, role: User['role']) => {
      if (uid === currentUser?.uid) {
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'You cannot change your own role.',
          });
          return;
      }
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { role }, { merge: true });
  };
  
  const deleteUser = async (uid: string) => {
    if (uid === currentUser?.uid) {
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'You cannot delete your own account.',
          });
          return;
      }
      await firestoreDeleteDoc(doc(db, 'users', uid));
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const id = `inv-${Date.now()}`;
    const lastUpdated = new Date().toISOString();
    const newItem: InventoryItem = { ...item, id, lastUpdated };
    await setDoc(doc(db, 'inventory', id), newItem);
  };
  
  const updateInventoryItemStock = async (itemId: string, amount: number) => {
    const itemRef = doc(db, 'inventory', itemId);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) {
      throw new Error("Inventory item not found");
    }

    const currentStock = itemDoc.data().stock;
    const newStock = currentStock + amount;

    if (newStock < 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Operation',
        description: 'Stock quantity cannot be negative.',
      });
      return;
    }

    await updateDoc(itemRef, {
      stock: newStock,
      lastUpdated: new Date().toISOString(),
    });

     toast({
      title: 'Stock Updated',
      description: `Stock for ${itemDoc.data().name} has been updated.`,
    });
  };

  const deleteInventoryItem = async (itemId: string) => {
    await firestoreDeleteDoc(doc(db, 'inventory', itemId));
    toast({
        title: "Item Deleted",
        description: "The inventory item has been removed.",
    });
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
    currentUser,
    signIn,
    signOut: handleSignOut,
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

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
