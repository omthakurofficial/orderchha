const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwmmtlqwjlqplhtlboyg.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bW10bHF3amxxcGxodGxib3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NzAyMzMsImV4cCI6MjA0MjI0NjIzM30.PBfUYCeFiLwFXdEcjfmgJQHHjIpFSB5zlrXwO4Nz_OE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBillingStatus() {
  console.log('🔍 Checking billing and payment system status...');
  
  try {
    // Check if tables exist and their current status
    const { data: tables, error: tableError } = await supabase
      .from('tables')
      .select('*')
      .order('id');
    
    if (tableError) {
      console.error('❌ Tables error:', tableError);
      return;
    }
    
    console.log(`📋 Found ${tables?.length || 0} tables`);
    console.log('Table statuses:', tables?.map(t => `Table ${t.id}: ${t.status}`));
    
    // Check orders ready for billing
    const { data: billingOrders, error: billingError } = await supabase
      .from('orders')
      .select(`
        id, table_id, status, total_amount, created_at,
        order_items (
          id, menu_item_id, quantity, price,
          menu_items (name)
        )
      `)
      .eq('status', 'ready')
      .order('created_at');
    
    if (billingError) {
      console.error('❌ Billing orders error:', billingError);
    } else {
      console.log(`💰 Found ${billingOrders?.length || 0} orders ready for billing`);
      billingOrders?.forEach(order => {
        console.log(`  - Order ${order.id}: Table ${order.table_id}, Amount: ${order.total_amount}`);
      });
    }
    
    // Check recent transactions
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (transError) {
      console.error('❌ Transactions error:', transError);
    } else {
      console.log(`💳 Found ${transactions?.length || 0} recent transactions`);
      transactions?.forEach(trans => {
        console.log(`  - Transaction ${trans.id}: Table ${trans.table_id}, Amount: ${trans.total_amount}, Method: ${trans.method}`);
      });
    }
    
    // Check for any orders stuck in processing states
    const { data: allOrders, error: allOrdersError } = await supabase
      .from('orders')
      .select('id, table_id, status, total_amount')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!allOrdersError) {
      console.log('\n📊 Recent order statuses:');
      allOrders?.forEach(order => {
        console.log(`  - Order ${order.id}: Table ${order.table_id}, Status: ${order.status}, Amount: ${order.total_amount}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking status:', error);
  }
}

checkBillingStatus();
