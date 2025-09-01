// Firebase Bridge: Provides Firebase compatibility and fallback for Supabase
import type { 
  MenuCategory, MenuItem, TableData, Order, OrderItem, 
  Settings, InventoryItem, Transaction, User,
  TableChangeCallback, OrderChangeCallback, Subscription
} from '../types/database';

// Flag to track initialization
let firebaseInitialized = false;
let firestoreInstance: any = null;

// Types for Firebase initialization
interface FirebaseApp {
  name: string;
  options: Record<string, any>;
}

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Initialize Firebase when needed
export function initFirebase() {
  // Return early if already initialized
  if (firebaseInitialized && firestoreInstance) {
    return { 
      db: firebaseDb, 
      isFirebaseAvailable: true 
    };
  }
  
  try {
    // Check if we have Firebase config
    const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
    if (!firebaseConfigString) {
      console.warn('Firebase config not available, using fallback');
      return { 
        db: fallbackDb, 
        isFirebaseAvailable: false 
      };
    }

    // Only initialize in browser
    if (typeof window === 'undefined') {
      console.log('Firebase not initialized in server context');
      return { 
        db: fallbackDb, 
        isFirebaseAvailable: false 
      };
    }

    // Dynamic imports to prevent SSR issues
    const loadFirebase = async () => {
      try {
        // Parse config
        const firebaseConfig = JSON.parse(firebaseConfigString) as FirebaseConfig;
        
        // Import Firebase modules
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore } = await import('firebase/firestore');
        
        // Initialize Firebase app
        const app = getApps().length === 0 
          ? initializeApp(firebaseConfig)
          : getApp();
        
        // Get Firestore instance
        firestoreInstance = getFirestore(app);
        firebaseInitialized = true;
        
        console.log('✅ Firebase initialized successfully');
        return true;
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
      }
    };
    
    // Start async initialization
    loadFirebase();
    
    // Return fallback for now (will use Firebase on next call if init succeeds)
    return { 
      db: fallbackDb, 
      isFirebaseAvailable: false 
    };
  } catch (error) {
    console.error('Error in Firebase init:', error);
    return { 
      db: fallbackDb, 
      isFirebaseAvailable: false 
    };
  }
}

// Firebase database implementation
export const firebaseDb = {
  // Menu operations
  async getMenu(): Promise<MenuCategory[]> {
    if (!firestoreInstance) return [];
    
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const menuRef = collection(firestoreInstance, 'menu');
      const snapshot = await getDocs(menuRef);
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        menu_items: [] // We'll fetch these separately if needed
      }));
    } catch (error) {
      console.error('Error fetching menu from Firebase:', error);
      return [];
    }
  },
  
  async addMenuItem(categoryName: string, item: MenuItem): Promise<MenuItem> {
    if (!firestoreInstance) throw new Error('Firebase not initialized');
    
    try {
      const { collection, query, where, getDocs, addDoc } = await import('firebase/firestore');
      
      // Find the category first
      const categoryRef = collection(firestoreInstance, 'menu');
      const q = query(categoryRef, where('name', '==', categoryName));
      const categorySnapshot = await getDocs(q);
      
      if (categorySnapshot.empty) {
        throw new Error(`Category "${categoryName}" not found`);
      }
      
      const categoryDoc = categorySnapshot.docs[0];
      
      // Add the menu item
      const itemsRef = collection(firestoreInstance, `menu/${categoryDoc.id}/items`);
      const newItemRef = await addDoc(itemsRef, item);
      
      return {
        ...item,
        id: newItemRef.id
      };
    } catch (error) {
      console.error('Error adding menu item to Firebase:', error);
      throw error;
    }
  },
  
  // Tables operations
  async getTables(): Promise<TableData[]> {
    if (!firestoreInstance) return [];
    
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const tablesRef = collection(firestoreInstance, 'tables');
      const snapshot = await getDocs(tablesRef);
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map((doc: any) => ({
        id: Number(doc.id),
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching tables from Firebase:', error);
      return [];
    }
  },
  
  async addTable(tableData: TableData): Promise<TableData> {
    if (!firestoreInstance) throw new Error('Firebase not initialized');
    
    try {
      const { collection, getDocs, doc, setDoc } = await import('firebase/firestore');
      
      // Generate a new ID
      const tablesRef = collection(firestoreInstance, 'tables');
      const snapshot = await getDocs(tablesRef);
      
      const tableIds = snapshot.docs.map((doc: any) => Number(doc.id));
      const nextId = tableIds.length > 0 ? Math.max(...tableIds) + 1 : 1;
      
      // Create the table
      const newTable: TableData = {
        ...tableData,
        status: 'available' as const
      };
      
      const tableDocRef = doc(firestoreInstance, 'tables', String(nextId));
      await setDoc(tableDocRef, newTable);
      
      return {
        ...newTable,
        id: nextId
      };
    } catch (error) {
      console.error('Error adding table to Firebase:', error);
      throw error;
    }
  },
  
  async updateTable(tableId: number, tableData: Partial<TableData>): Promise<TableData> {
    if (!firestoreInstance) throw new Error('Firebase not initialized');
    
    try {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore');
      
      const tableRef = doc(firestoreInstance, 'tables', String(tableId));
      await updateDoc(tableRef, tableData as any);
      
      const updatedTable = await getDoc(tableRef);
      
      return {
        id: tableId,
        ...(updatedTable.data() as TableData)
      };
    } catch (error) {
      console.error('Error updating table in Firebase:', error);
      throw error;
    }
  },
  
  // Settings operations
  async getSettings(): Promise<Settings> {
    if (!firestoreInstance) {
      return {
        cafeName: 'OrderChha Restaurant',
        address: 'Kathmandu, Nepal',
        phone: '+977-9800000000',
        logo: 'https://i.ibb.co/6r11CNc/logo.png',
        qrPaymentUrl: ''
      };
    }
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const settingsRef = doc(firestoreInstance, 'settings', 'app');
      const docSnap = await getDoc(settingsRef);
      
      if (!docSnap.exists()) {
        return {
          cafeName: 'OrderChha Restaurant',
          address: 'Kathmandu, Nepal',
          phone: '+977-9800000000',
          logo: 'https://i.ibb.co/6r11CNc/logo.png',
          qrPaymentUrl: ''
        };
      }
      
      return docSnap.data() as Settings;
    } catch (error) {
      console.error('Error fetching settings from Firebase:', error);
      return {
        cafeName: 'OrderChha Restaurant',
        address: 'Kathmandu, Nepal',
        phone: '+977-9800000000',
        logo: 'https://i.ibb.co/6r11CNc/logo.png',
        qrPaymentUrl: ''
      };
    }
  },
  
  async updateSettings(settings: Settings): Promise<Settings> {
    if (!firestoreInstance) throw new Error('Firebase not initialized');
    
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      
      const settingsRef = doc(firestoreInstance, 'settings', 'app');
      await setDoc(settingsRef, settings);
      
      return settings;
    } catch (error) {
      console.error('Error updating settings in Firebase:', error);
      throw error;
    }
  },
  
  // Orders operations
  async getKitchenOrders(): Promise<Order[]> {
    if (!firestoreInstance) return [];
    
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const ordersRef = collection(firestoreInstance, 'orders');
      const q = query(ordersRef, where('status', 'in', ['pending', 'preparing']));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error('Error fetching kitchen orders from Firebase:', error);
      return [];
    }
  },
  
  async placeOrder(tableId: number, items: OrderItem[]): Promise<Order> {
    if (!firestoreInstance) throw new Error('Firebase not initialized');
    
    try {
      const { collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
      
      const newOrder: Order = {
        tableId,
        items,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const orderRef = collection(firestoreInstance, 'orders');
      const docRef = await addDoc(orderRef, newOrder);
      
      // Update table status
      const tableRef = doc(firestoreInstance, 'tables', String(tableId));
      await updateDoc(tableRef, {
        status: 'occupied'
      });
      
      return {
        id: docRef.id,
        ...newOrder
      };
    } catch (error) {
      console.error('Error placing order in Firebase:', error);
      throw error;
    }
  },
  
  async completeKitchenOrder(orderId: string): Promise<Order> {
    if (!firestoreInstance) throw new Error('Firebase not initialized');
    
    try {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore');
      
      const orderRef = doc(firestoreInstance, 'orders', orderId);
      await updateDoc(orderRef, { status: 'completed' });
      
      const updatedOrder = await getDoc(orderRef);
      
      return {
        id: orderId,
        ...(updatedOrder.data() as Order)
      };
    } catch (error) {
      console.error('Error completing kitchen order in Firebase:', error);
      throw error;
    }
  },
  
  // Inventory operations
  async getInventory(): Promise<InventoryItem[]> {
    if (!firestoreInstance) return [];
    
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      
      const inventoryRef = collection(firestoreInstance, 'inventory');
      const snapshot = await getDocs(inventoryRef);
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
    } catch (error) {
      console.error('Error fetching inventory from Firebase:', error);
      return [];
    }
  },
  
  async updateInventory(itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    if (!firestoreInstance) throw new Error('Firebase not initialized');
    
    try {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore');
      
      const itemRef = doc(firestoreInstance, 'inventory', itemId);
      await updateDoc(itemRef, updates as any);
      
      const updatedItem = await getDoc(itemRef);
      
      return {
        id: itemId,
        ...(updatedItem.data() as InventoryItem)
      };
    } catch (error) {
      console.error('Error updating inventory item in Firebase:', error);
      throw error;
    }
  },
  
  // Subscriptions
  subscribeToTables(callback: TableChangeCallback): Subscription {
    if (!firestoreInstance) {
      return { unsubscribe: () => {} };
    }
    
    try {
      const setupSubscription = async () => {
        const { collection, onSnapshot } = await import('firebase/firestore');
        
        return onSnapshot(
          collection(firestoreInstance, 'tables'),
          (snapshot: any) => {
            snapshot.docChanges().forEach((change: any) => {
              callback({
                type: change.type,
                doc: {
                  id: Number(change.doc.id),
                  ...change.doc.data()
                }
              });
            });
          },
          (error: any) => {
            console.error('Error in tables subscription:', error);
          }
        );
      };
      
      // Return a dummy unsubscribe that will be replaced with the real one
      let unsubscribeFn = () => {};
      
      // Set up the actual subscription asynchronously
      setupSubscription().then(unsubscribe => {
        unsubscribeFn = unsubscribe;
      });
      
      // Return subscription with a wrapper function that will call the real unsubscribe
      return {
        unsubscribe: () => unsubscribeFn()
      };
    } catch (error) {
      console.error('Error setting up tables subscription:', error);
      return { unsubscribe: () => {} };
    }
  },
  
  subscribeToOrders(callback: OrderChangeCallback): Subscription {
    if (!firestoreInstance) {
      return { unsubscribe: () => {} };
    }
    
    try {
      const setupSubscription = async () => {
        const { collection, onSnapshot } = await import('firebase/firestore');
        
        return onSnapshot(
          collection(firestoreInstance, 'orders'),
          (snapshot: any) => {
            snapshot.docChanges().forEach((change: any) => {
              callback({
                type: change.type,
                doc: {
                  id: change.doc.id,
                  ...change.doc.data()
                }
              });
            });
          },
          (error: any) => {
            console.error('Error in orders subscription:', error);
          }
        );
      };
      
      // Return a dummy unsubscribe that will be replaced with the real one
      let unsubscribeFn = () => {};
      
      // Set up the actual subscription asynchronously
      setupSubscription().then(unsubscribe => {
        unsubscribeFn = unsubscribe;
      });
      
      // Return subscription with a wrapper function that will call the real unsubscribe
      return {
        unsubscribe: () => unsubscribeFn()
      };
    } catch (error) {
      console.error('Error setting up orders subscription:', error);
      return { unsubscribe: () => {} };
    }
  },
  
  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    if (!firestoreInstance) return [];
    
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      
      const transactionsRef = collection(firestoreInstance, 'transactions');
      const snapshot = await getDocs(transactionsRef);
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error) {
      console.error('Error fetching transactions from Firebase:', error);
      return [];
    }
  },
  
  // Users
  async getUsers(): Promise<User[]> {
    if (!firestoreInstance) return [{
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      photoURL: 'https://i.ibb.co/6r11CNc/logo.png'
    }];
    
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      
      const usersRef = collection(firestoreInstance, 'users');
      const snapshot = await getDocs(usersRef);
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error fetching users from Firebase:', error);
      return [{
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        photoURL: 'https://i.ibb.co/6r11CNc/logo.png'
      }];
    }
  }
};

// Fallback database (local data)
export const fallbackDb = {
  // Menu operations
  async getMenu(): Promise<MenuCategory[]> {
    const { MENU } = require('./data');
    return MENU;
  },
  
  async addMenuItem(_categoryName: string, _item: MenuItem): Promise<MenuItem> {
    throw new Error('Cannot add menu items in fallback mode');
  },
  
  // Tables operations
  async getTables(): Promise<TableData[]> {
    const { TABLES } = require('./data');
    return TABLES;
  },
  
  async addTable(_tableData: TableData): Promise<TableData> {
    throw new Error('Cannot add tables in fallback mode');
  },
  
  async updateTable(_tableId: number, _tableData: Partial<TableData>): Promise<TableData> {
    throw new Error('Cannot update tables in fallback mode');
  },
  
  // Settings operations
  async getSettings(): Promise<Settings> {
    return {
      cafeName: 'OrderChha Restaurant',
      address: 'Kathmandu, Nepal',
      phone: '+977-9800000000',
      logo: 'https://i.ibb.co/6r11CNc/logo.png',
      qrPaymentUrl: ''
    };
  },
  
  async updateSettings(_settings: Settings): Promise<Settings> {
    throw new Error('Cannot update settings in fallback mode');
  },
  
  // Orders operations
  async getKitchenOrders(): Promise<Order[]> {
    return [];
  },
  
  async placeOrder(_tableId: number, _items: OrderItem[]): Promise<Order> {
    throw new Error('Cannot place orders in fallback mode');
  },
  
  async completeKitchenOrder(_orderId: string): Promise<Order> {
    throw new Error('Cannot complete kitchen orders in fallback mode');
  },
  
  // Inventory operations
  async getInventory(): Promise<InventoryItem[]> {
    return [];
  },
  
  async updateInventory(_itemId: string, _updates: Partial<InventoryItem>): Promise<InventoryItem> {
    throw new Error('Cannot update inventory in fallback mode');
  },
  
  // Subscriptions
  subscribeToTables(_callback: TableChangeCallback): Subscription {
    return { unsubscribe: () => {} };
  },
  
  subscribeToOrders(_callback: OrderChangeCallback): Subscription {
    return { unsubscribe: () => {} };
  },
  
  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return [];
  },
  
  // Users
  async getUsers(): Promise<User[]> {
    return [{
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      photoURL: 'https://i.ibb.co/6r11CNc/logo.png'
    }];
  }
};
