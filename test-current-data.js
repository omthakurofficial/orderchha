const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkOrdersAndItems() {
  console.log('🔍 Checking orders and items...');
  
  try {
    // Check all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return;
    }
    
    console.log('📋 All orders:', orders);
    
    // Check order items for each order
    for (const order of orders || []) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          menu_items (
            id,
            name,
            description,
            price,
            image_url
          )
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.error(`Error fetching items for order ${order.id}:`, itemsError);
        continue;
      }
      
      console.log(`🍽️ Items for order ${order.id} (Table ${order.table_id}, Status: ${order.status}):`, items);
    }
    
    // Check transactions
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (transError) {
      console.error('Error fetching transactions:', transError);
      return;
    }
    
    console.log('💳 All transactions:', transactions);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkOrdersAndItems();
