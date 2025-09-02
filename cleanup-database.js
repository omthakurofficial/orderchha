const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://duzqqpcxatbdcxoevepy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFxcGN4YXRiZGN4b2V2ZXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUwNjEsImV4cCI6MjA3MTk0MTA2MX0.JkywYdsGZ4ZEF-Mloo3gDr85gqwhJ6iKuka3-ZQvrew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupAllData() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Delete transactions first (no foreign key dependencies)
    console.log('🗑️ Cleaning transactions...');
    const { error: transError } = await supabase
      .from('transactions')
      .delete()
      .neq('id', 'impossible-id'); // Delete all rows
    
    if (transError) console.log('Transactions cleanup:', transError.message);
    else console.log('✅ Transactions cleaned');

    // Delete order_items (depends on orders)
    console.log('🗑️ Cleaning order_items...');
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .neq('id', 'impossible-id'); // Delete all rows
    
    if (itemsError) console.log('Order items cleanup:', itemsError.message);
    else console.log('✅ Order items cleaned');

    // Delete orders
    console.log('🗑️ Cleaning orders...');
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', 'impossible-id'); // Delete all rows
    
    if (ordersError) console.log('Orders cleanup:', ordersError.message);
    else console.log('✅ Orders cleaned');

    // Reset all tables to available status
    console.log('🔄 Resetting table statuses...');
    const { error: tablesError } = await supabase
      .from('tables')
      .update({ status: 'available' })
      .neq('status', 'impossible-status'); // Update all rows
    
    if (tablesError) console.log('Tables reset:', tablesError.message);
    else console.log('✅ Tables reset to available');

    // Verify cleanup
    console.log('\n📊 Verification:');
    
    const { data: orders } = await supabase.from('orders').select('count(*)');
    const { data: orderItems } = await supabase.from('order_items').select('count(*)');
    const { data: transactions } = await supabase.from('transactions').select('count(*)');
    const { data: availableTables } = await supabase.from('tables').select('count(*)').eq('status', 'available');
    
    console.log(`Orders remaining: ${orders?.[0]?.count || 0}`);
    console.log(`Order items remaining: ${orderItems?.[0]?.count || 0}`);
    console.log(`Transactions remaining: ${transactions?.[0]?.count || 0}`);
    console.log(`Available tables: ${availableTables?.[0]?.count || 0}`);
    
    console.log('\n🎉 Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanupAllData();
