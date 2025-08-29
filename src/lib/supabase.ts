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
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select();
    if (error) throw error;
    return data[0];
  },

  async getKitchenOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, table_id, status, created_at, total_amount,
        order_items (
          id, menu_item_id, quantity, price,
          menu_items (name, image)
        )
      `)
      .in('status', ['pending', 'preparing'])
      .order('created_at');
    if (error) throw error;
    return data;
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
