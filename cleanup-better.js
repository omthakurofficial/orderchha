const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://duzqqpcxatbdcxoevepy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFxcGN4YXRiZGN4b2V2ZXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUwNjEsImV4cCI6MjA3MTk0MTA2MX0.JkywYdsGZ4ZEF-Mloo3gDr85gqwhJ6iKuka3-ZQvrew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupBetter() {
  try {
    console.log('🧹 Starting better cleanup...');
    
    // Get all data first to see what we're working with
    const { data: allOrders } = await supabase.from('orders').select('id, table_id, status, total_amount');
    const { data: allTransactions } = await supabase.from('transactions').select('id, table_id, total_amount');
    const { data: allOrderItems } = await supabase.from('order_items').select('id, menu_item_id, quantity');
    
    console.log('📊 Current data:');
    console.log(`Orders: ${allOrders?.length || 0}`);
    console.log(`Transactions: ${allTransactions?.length || 0}`);
    console.log(`Order Items: ${allOrderItems?.length || 0}`);
    
    if (allOrders && allOrders.length > 0) {
      console.log('Orders details:', allOrders);
    }
    
    // Delete using specific IDs if they exist
    if (allTransactions && allTransactions.length > 0) {
      console.log('🗑️ Deleting transactions...');
      const transIds = allTransactions.map(t => t.id);
      const { error } = await supabase.from('transactions').delete().in('id', transIds);
      if (error) console.log('Transaction delete error:', error.message);
      else console.log('✅ Transactions deleted');
    }

    if (allOrderItems && allOrderItems.length > 0) {
      console.log('🗑️ Deleting order items...');
      const itemIds = allOrderItems.map(i => i.id);
      const { error } = await supabase.from('order_items').delete().in('id', itemIds);
      if (error) console.log('Order items delete error:', error.message);
      else console.log('✅ Order items deleted');
    }

    if (allOrders && allOrders.length > 0) {
      console.log('🗑️ Deleting orders...');
      const orderIds = allOrders.map(o => o.id);
      const { error } = await supabase.from('orders').delete().in('id', orderIds);
      if (error) console.log('Orders delete error:', error.message);
      else console.log('✅ Orders deleted');
    }

    // Reset tables
    console.log('🔄 Resetting all tables to available...');
    const { data: tables } = await supabase.from('tables').select('id');
    if (tables && tables.length > 0) {
      const { error } = await supabase
        .from('tables')
        .update({ status: 'available' })
        .in('id', tables.map(t => t.id));
      
      if (error) console.log('Tables reset error:', error.message);
      else console.log('✅ All tables reset to available');
    }

    // Final verification
    console.log('\n📊 Final verification:');
    const { data: remainingOrders } = await supabase.from('orders').select('id');
    const { data: remainingTransactions } = await supabase.from('transactions').select('id');
    const { data: remainingItems } = await supabase.from('order_items').select('id');
    const { data: availableTables } = await supabase.from('tables').select('id, status').eq('status', 'available');

    console.log(`Orders remaining: ${remainingOrders?.length || 0}`);
    console.log(`Transactions remaining: ${remainingTransactions?.length || 0}`);
    console.log(`Order items remaining: ${remainingItems?.length || 0}`);
    console.log(`Available tables: ${availableTables?.length || 0}`);
    
    console.log('\n🎉 Database is now clean and ready for fresh data!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanupBetter();
