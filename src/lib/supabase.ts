import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://duzqqpcxatbdcxoevepy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFxcGN4YXRiZGN4b2V2ZXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUwNjEsImV4cCI6MjA3MTk0MTA2MX0.JkywYdsGZ4ZEF-Mloo3gDr85gqwhJ6iKuka3-ZQvrew';
const shouldLogSupabaseInit =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_DEBUG_SUPABASE === 'true';

// Enhanced error handling for connection issues
let supabaseClient: any;

try {
  // Debug configuration
  if (shouldLogSupabaseInit) {
    console.log('🔧 Supabase Configuration:', {
      url: supabaseUrl ? '✅ URL Set' : '❌ URL Missing',
      key: supabaseAnonKey ? '✅ Key Set' : '❌ Key Missing',
    });
  }

  // Create the Supabase client
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  
  if (shouldLogSupabaseInit) {
    console.log('✅ Supabase client initialized successfully');
  }
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

export const supabase: any = supabaseClient;

const normalizeMobile = (mobile: string) => mobile.replace(/[^0-9+]/g, '').trim();
const isNoRowsError = (error: unknown) => (
  !!error &&
  typeof error === 'object' &&
  'code' in error &&
  (error as { code?: string }).code === 'PGRST116'
);

export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data.session;
  },

  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      throw error;
    }

    return data.user;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return data.user;
  },

  onAuthStateChange: (callback: (user: any | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      callback(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  },
};

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

  async getMenuCategories() {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getMenuItems() {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');
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
      console.log('🔍 Creating order with data:', orderData);
      console.log('🔍 Creating order items:', orderItems);
      
      // First create the order
      const { data: orderResponse, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (orderError) {
        console.error('❌ Order creation error:', orderError);
        throw new Error(`Order creation failed: ${orderError.message || JSON.stringify(orderError)}`);
      }
      
      console.log('✅ Order created:', orderResponse);
      
      // Then create order items
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: orderResponse.id
      }));
      
      console.log('🔍 Order items with order ID:', itemsWithOrderId);
      
      const { data: itemsResponse, error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)
        .select();
      
      if (itemsError) {
        console.error('❌ Order items creation error:', itemsError);
        console.error('❌ Full error details:', JSON.stringify(itemsError, null, 2));
        if ('code' in itemsError) {
          console.error('❌ Error code:', itemsError.code);
          console.error('❌ Error message:', itemsError.message);
          console.error('❌ Error details:', itemsError.details);
        }
        throw new Error(`Order items creation failed: ${itemsError.message || JSON.stringify(itemsError)}`);
      }
      
      console.log('✅ Order items created:', itemsResponse);
      
      return { order: orderResponse, items: itemsResponse };
    } catch (err) {
      console.error('❌ Critical error in createOrderWithItems:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error constructor:', err?.constructor?.name);
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
            menu_items (name, image_url, description)
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

  async getOrderById(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, table_id, status, created_at, total_amount, customer_name, phone, notes,
          order_items (
            id, menu_item_id, quantity, price,
            menu_items (name, image_url, description)
          )
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting order by ID:', err);
      return null;
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
            menu_items (name, image_url, description)
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
            menu_items (name, image_url, description)
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
            menu_items (name, image_url, description)
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

  async getUserByAuth(authUserId: string, email?: string) {
    let query = supabase
      .from('users')
      .select('*')
      .limit(1);

    if (authUserId && email) {
      query = query.or(`auth_user_id.eq.${authUserId},email.eq.${email}`);
    } else if (authUserId) {
      query = query.eq('auth_user_id', authUserId);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data?.[0] || null;
  },

  async updateSettings(settings: any) {
    const { data, error } = await supabase
      .from('settings')
      .upsert(settings)
      .select();
    if (error) throw error;
    return data[0];
  },

  async getLoyaltySettings() {
    const { data, error } = await supabase
      .from('loyalty_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async updateLoyaltySettings(settings: {
    points_per_npr_ratio: number;
    min_redemption_threshold: number;
    points_expiry_days: number;
  }) {
    const payload = {
      id: 'default',
      ...settings,
    };

    const { data, error } = await supabase
      .from('loyalty_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getCustomerByMobile(mobile: string) {
    const cleanedMobile = normalizeMobile(mobile);
    if (!cleanedMobile) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, uid, name, email, mobile, address, is_customer')
      .eq('mobile', cleanedMobile)
      .limit(1)
      .single();

    if (error && !isNoRowsError(error)) {
      throw error;
    }

    return data || null;
  },

  async upsertCustomerProfile(profile: {
    name: string;
    mobile: string;
    address: string;
    email?: string;
  }) {
    const cleanedMobile = normalizeMobile(profile.mobile);
    if (!cleanedMobile) {
      throw new Error('Customer mobile number is required.');
    }

    const existingCustomer = await this.getCustomerByMobile(cleanedMobile);

    if (existingCustomer) {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: profile.name || existingCustomer.name,
          email: profile.email || existingCustomer.email,
          mobile: cleanedMobile,
          address: profile.address || existingCustomer.address,
          is_customer: true,
        })
        .eq('id', existingCustomer.id)
        .select('id, uid, name, email, mobile, address, is_customer')
        .single();

      if (error) {
        throw error;
      }

      return data;
    }

    const uid = `customer-${cleanedMobile}-${Date.now()}`;

    const { data, error } = await supabase
      .from('users')
      .insert({
        uid,
        name: profile.name,
        email: profile.email || null,
        mobile: cleanedMobile,
        address: profile.address,
        role: 'staff',
        is_customer: true,
        active: true,
      })
      .select('id, uid, name, email, mobile, address, is_customer')
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getCustomerLoyaltyByMobile(mobile: string) {
    const cleanedMobile = normalizeMobile(mobile);
    if (!cleanedMobile) {
      return null;
    }

    const customer = await this.getCustomerByMobile(cleanedMobile);
    if (!customer) {
      return null;
    }

    const { data: loyaltyData, error } = await supabase
      .from('user_loyalty')
      .select('id, current_balance, user_mobile_number, updated_at')
      .eq('user_id', customer.id)
      .limit(1)
      .single();

    if (error && !isNoRowsError(error)) {
      throw error;
    }

    return {
      customer,
      loyalty: loyaltyData || {
        current_balance: 0,
        user_mobile_number: cleanedMobile,
      },
    };
  },

  async applyLoyaltyForCompletedPayment(input: {
    transactionId?: string;
    totalBill: number;
    paymentMethod: 'cash' | 'online' | 'card' | 'qr';
    source: 'In-house' | 'Online';
    customer: {
      name: string;
      mobile: string;
      address: string;
      email?: string;
    };
    pointsToRedeem?: number;
  }) {
    const loyaltySettings = await this.getLoyaltySettings();
    const customer = await this.upsertCustomerProfile(input.customer);

    const { data: existingLoyalty, error: loyaltyFetchError } = await supabase
      .from('user_loyalty')
      .select('id, current_balance')
      .eq('user_id', customer.id)
      .limit(1)
      .single();

    if (loyaltyFetchError && !isNoRowsError(loyaltyFetchError)) {
      throw loyaltyFetchError;
    }

    const currentBalance = Number(existingLoyalty?.current_balance || 0);
    const requestedRedeemPoints = Math.max(0, Number(input.pointsToRedeem || 0));
    const redeemThreshold = Number(loyaltySettings.min_redemption_threshold || 0);
    const pointsRatio = Number(loyaltySettings.points_per_npr_ratio || 0);

    let pointsRedeemed = 0;
    if (requestedRedeemPoints >= redeemThreshold && currentBalance >= requestedRedeemPoints) {
      pointsRedeemed = requestedRedeemPoints;
    }

    const maxDiscountByPoints = pointsRatio > 0 ? pointsRedeemed / pointsRatio : 0;
    const nprDiscount = Math.min(Number(input.totalBill || 0), maxDiscountByPoints);
    const billAfterDiscount = Math.max(0, Number(input.totalBill || 0) - nprDiscount);
    const pointsEarned = Number((billAfterDiscount * pointsRatio).toFixed(2));
    const nextBalance = Number((currentBalance - pointsRedeemed + pointsEarned).toFixed(2));

    await supabase
      .from('user_loyalty')
      .upsert({
        user_id: customer.id,
        user_mobile_number: normalizeMobile(input.customer.mobile),
        current_balance: nextBalance,
      });

    const expiryDays = Number(loyaltySettings.points_expiry_days || 0);
    const expiresAt = expiryDays > 0
      ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await supabase
      .from('loyalty_ledger')
      .insert({
        user_id: customer.id,
        user_mobile_number: normalizeMobile(input.customer.mobile),
        transaction_id: input.transactionId || null,
        points_earned: pointsEarned,
        points_redeemed: pointsRedeemed,
        npr_discount: nprDiscount,
        source: input.source,
        payment_method: input.paymentMethod,
        bill_amount: Number(input.totalBill || 0),
        notes: `Dynamic ratio ${pointsRatio} applied at payment completion`,
        expires_at: expiresAt,
      });

    return {
      customer,
      settings: loyaltySettings,
      currentBalance,
      pointsRedeemed,
      pointsEarned,
      nprDiscount,
      nextBalance,
      billAfterDiscount,
    };
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
      console.log('🔍 getBillingReadyOrders called');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, table_id, status, created_at, total_amount, customer_name, phone, notes,
          order_items (
            id, menu_item_id, quantity, price,
            menu_items (name, image_url, description)
          )
        `)
        .eq('status', 'ready')
        .order('created_at');
      
      console.log('📊 getBillingReadyOrders response:', { 
        data, 
        error, 
        dataLength: data?.length,
        statuses: data?.map((o: any) => o.status) 
      });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('❌ Error getting billing ready orders:', err);
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
      // Update order status to ready (ready for billing)
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'ready' })
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

  // Get completed orders for a specific table (for receipts)
  async getCompletedOrdersByTable(tableId: number) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, table_id, status, created_at, total_amount, customer_name, phone, notes,
          order_items (
            id, menu_item_id, quantity, price,
            menu_items (name, image_url, description)
          )
        `)
        .eq('table_id', tableId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting completed orders by table:', err);
      return [];
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
