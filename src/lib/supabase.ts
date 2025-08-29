import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug configuration
console.log('🔧 Supabase Configuration:', {
  url: supabaseUrl ? '✅ URL Set' : '❌ URL Missing',
  key: supabaseAnonKey ? '✅ Key Set' : '❌ Key Missing',
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: false, // Since we're using Appwrite for auth
  },
});

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

  // Real-time subscriptions
  subscribeToTables(callback: (payload: any) => void) {
    return supabase
      .channel('tables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, callback)
      .subscribe();
  },

  subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  },
};
