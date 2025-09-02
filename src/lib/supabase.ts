import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://duzqqpcxatbdcxoevepy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFxcGN4YXRiZGN4b2V2ZXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUwNjEsImV4cCI6MjA3MTk0MTA2MX0.JkywYdsGZ4ZEF-Mloo3gDr85gqwhJ6iKuka3-ZQvrew';

// Enhanced error handling for connection issues
let supabaseClient;

try {
  // Debug configuration
  console.log('🔧 Supabase Configuration:', {
    url: supabaseUrl ? '✅ URL Set' : '❌ URL Missing',
    key: supabaseAnonKey ? '✅ Key Set' : '❌ Key Missing',
  });

  // Create the Supabase client
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      persistSession: false, // Since we're using Appwrite for auth
    },
  });
  
  console.log('✅ Supabase client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  
  // Create a type-safe mock client to prevent app crashes
  // This handles all the common PostgrestFilterBuilder methods
  const mockPostgrestBuilder = {
    select: () => ({
      data: [],
      error: new Error('Supabase client failed to initialize'),
      order: () => mockPostgrestBuilder.select(),
      limit: () => mockPostgrestBuilder.select(),
      eq: () => mockPostgrestBuilder.select(),
      in: () => mockPostgrestBuilder.select(),
      single: () => ({ data: null, error: new Error('Supabase client failed to initialize') }),
    }),
    insert: () => ({
      data: null,
      error: new Error('Supabase client failed to initialize'),
      select: () => mockPostgrestBuilder.select(),
    }),
    update: () => ({
      data: null,
      error: new Error('Supabase client failed to initialize'),
      eq: () => ({
        data: null,
        error: new Error('Supabase client failed to initialize'),
        select: () => mockPostgrestBuilder.select(),
      }),
    }),
    delete: () => ({
      data: null,
      error: new Error('Supabase client failed to initialize'),
      eq: () => mockPostgrestBuilder.select(),
    }),
    upsert: () => ({
      data: null,
      error: new Error('Supabase client failed to initialize'),
      select: () => mockPostgrestBuilder.select(),
    }),
  };
  
  // The mock channel with proper TypeScript types
  const mockChannel = {
    on: (event: string, filter: any, callback: any) => mockChannel,
    subscribe: () => ({ unsubscribe: () => {} }),
  };
  
  supabaseClient = {
    from: () => mockPostgrestBuilder,
    channel: (name: string) => mockChannel,
  };
}

export const supabase = supabaseClient;

// Database helper functions for restaurant operations
export const db = {
  // Menu operations
  async getMenu() {
    const { data, error } = await supabase.from('menu_categories').select(`
      id, name, icon,
      menu_items (
        id, name, description, price, image, image_hint, in_stock
      )
    `).order('name');
    if (error) throw error;
    return data;
  },

  async addMenuItem(categoryId: string, item: any) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({ ...item, category_id: categoryId })
      .select();
    if (error) throw error;
    return data[0];
  },

  // Tables operations
  async getTables() {
    const { data, error } = await supabase.from('tables').select('*').order('id');
    if (error) throw error;
    return data;
  },

  async updateTableStatus(tableId: number, status: string) {
    const { data, error } = await supabase
      .from('tables')
      .update({ status })
      .eq('id', tableId)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Orders operations
  async createOrder(orderData: any) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  },

  async createOrderWithItems(orderData: any, orderItems: any[]) {
    try {
      // First create the order
      const { data: orderResponse, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Then create order items
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: orderResponse.id
      }));
      
      const { data: itemsResponse, error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)
        .select();
      
      if (itemsError) throw itemsError;
      
      return { order: orderResponse, items: itemsResponse };
    } catch (err) {
      console.error('Error creating order with items:', err);
      throw err;
    }
  },

  async updateOrder(orderId: string, orderData: any) {
    console.log('Updating order in Supabase:', orderId, orderData);
    
    if (!orderId) {
      console.error('Invalid order ID provided for update:', orderId);
      throw new Error('Invalid order ID provided for update');
    }
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', orderId)
        .select();
        
      if (error) {
        console.error('Supabase error updating order:', error.message);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error('Order not found for ID:', orderId);
        throw new Error('Order not found');
      }
      
      console.log('Successfully updated order:', data[0]);
      return data[0];
    } catch (err) {
      console.error('Error in updateOrder:', err);
      throw err;
    }
  },

  async getOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, table_id, status, created_at, total_amount, customer_name, phone, notes,
          order_items (
            id, menu_item_id, quantity, price,
            menu_items (name, image, description)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting orders:', err);
      return [];
    }
  },

  async getPendingOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, table_id, status, created_at, total_amount, customer_name, phone, notes,
          order_items (
            id, menu_item_id, quantity, price,
            menu_items (name, image, description)
          )
        `)
        .eq('status', 'pending')
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting pending orders:', err);
      return [];
    }
  },

  async getKitchenOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, table_id, status, created_at, total_amount, customer_name, phone, notes,
          order_items (
            id, menu_item_id, quantity, price,
            menu_items (name, image, description)
          )
        `)
        .in('status', ['preparing', 'ready'])
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting kitchen orders:', err);
      return [];
    }
  },

  async getBillingOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, table_id, status, created_at, total_amount, customer_name, phone, notes,
          order_items (
            id, menu_item_id, quantity, price,
            menu_items (name, image, description)
          )
        `)
        .eq('status', 'completed')
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting billing orders:', err);
      return [];
    }
  },

  // Settings operations
  async getSettings() {
    const { data, error } = await supabase.from('settings').select('*').limit(1);
    if (error) throw error;
    return data[0];
  },

  async updateSettings(settings: any) {
    const { data, error } = await supabase
      .from('settings')
      .upsert(settings)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Inventory operations
  async getInventory() {
    const { data, error } = await supabase.from('inventory').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async updateInventory(itemId: string, updates: any) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', itemId)
      .select();
    if (error) throw error;
    return data[0];
  },
  
  // Transactions operations
  async saveTransaction(transaction: any) {
    try {
      // Generate invoice number if not provided
      const invoiceNumber = transaction.invoice_number || `INV-${Date.now()}`;
      
      const transactionData = {
        ...transaction,
        invoice_number: invoiceNumber,
        total_amount: transaction.amount + (transaction.vat_amount || 0),
        status: 'completed'
      };
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select();
      
      // If there's an error with the database, fall back to localStorage
      if (error) {
        console.warn('Failed to save transaction to database, using localStorage instead:', error);
        this.saveTransactionToLocalStorage(transaction);
        return transaction;
      }
      
      return data[0];
    } catch (err) {
      // If there's any error, use localStorage as a fallback
      console.warn('Error saving transaction, using localStorage instead:', err);
      this.saveTransactionToLocalStorage(transaction);
      return transaction;
    }
  },

  async getTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, table_id, order_id, amount, vat_amount, total_amount,
          method, status, customer_name, phone, invoice_number,
          created_at, updated_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Failed to get transactions from database, using localStorage instead:', error);
        return this.getTransactionsFromLocalStorage();
      }
      
      return data || [];
    } catch (err) {
      console.warn('Error getting transactions, using localStorage instead:', err);
      return this.getTransactionsFromLocalStorage();
    }
  },
  
  saveTransactionToLocalStorage(transaction: any) {
    try {
      const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      existingTransactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(existingTransactions));
    } catch (err) {
      console.error('Failed to save transaction to localStorage:', err);
    }
  },
  
  getTransactionsFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem('transactions') || '[]');
    } catch (err) {
      console.error('Failed to get transactions from localStorage:', err);
      return [];
    }
  },

  // Get orders ready for billing (completed orders without transactions)
  async getBillingReadyOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, table_id, status, created_at, total_amount, customer_name, phone, notes,
          order_items (
            id, menu_item_id, quantity, price,
            menu_items (name, image, description)
          )
        `)
        .eq('status', 'ready')
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting billing ready orders:', err);
      return [];
    }
  },

  // Get tables that need billing
  async getTablesForBilling() {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'billing')
        .order('id');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting tables for billing:', err);
      return [];
    }
  },

  // Complete order and update table status
  async completeOrderAndUpdateTable(orderId: string, tableId: number) {
    try {
      // Update order status to completed
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);
      
      if (orderError) throw orderError;

      // Update table status to billing
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'billing' })
        .eq('id', tableId);
      
      if (tableError) throw tableError;

      return { success: true };
    } catch (err) {
      console.error('Error completing order and updating table:', err);
      throw err;
    }
  },

  // Real-time subscriptions with type safety
  subscribeToTables(callback: (payload: any) => void) {
    try {
      // Use a type assertion to handle the postgres_changes event
      return (supabase
        .channel('tables') as any)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, callback)
        .subscribe();
    } catch (error) {
      console.error('Failed to subscribe to tables changes:', error);
      return { unsubscribe: () => {} }; // Return a dummy unsubscribe function
    }
  },

  subscribeToOrders(callback: (payload: any) => void) {
    try {
      // Use a type assertion to handle the postgres_changes event
      return (supabase
        .channel('orders') as any)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
        .subscribe();
    } catch (error) {
      console.error('Failed to subscribe to orders changes:', error);
      return { unsubscribe: () => {} }; // Return a dummy unsubscribe function
    }
  },
};
