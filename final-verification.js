const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function finalSystemVerification() {
  console.log('🎯 FINAL SYSTEM VERIFICATION');
  console.log('============================\n');

  // 1. Check billing notification accuracy
  console.log('1️⃣ BILLING NOTIFICATION ACCURACY:');
  
  const { data: billingTables } = await supabase.from('tables').select('*').eq('status', 'billing');
  const { data: readyOrders } = await supabase.from('orders').select('*').eq('status', 'ready');
  
  console.log(`🪑 Tables with billing status: ${billingTables?.length || 0}`);
  console.log(`📋 Orders with ready status: ${readyOrders?.length || 0}`);
  
  if ((billingTables?.length || 0) === (readyOrders?.length || 0)) {
    console.log('✅ Billing notifications are synchronized');
  } else {
    console.log('⚠️ Billing notification mismatch detected');
  }

  // 2. Check pricing accuracy
  console.log('\n2️⃣ PRICING ACCURACY CHECK:');
  
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, table_id, total_amount,
      order_items(quantity, price, menu_items(name, price))
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  if (orders) {
    orders.forEach(order => {
      let calculatedTotal = 0;
      console.log(`📋 Order ${order.id.substring(0, 8)} - Table ${order.table_id}:`);
      
      order.order_items?.forEach(item => {
        const itemTotal = item.quantity * item.price;
        calculatedTotal += itemTotal;
        console.log(`   ${item.menu_items?.name}: ${item.quantity} × NPR ${item.price} = NPR ${itemTotal}`);
      });
      
      console.log(`   Calculated Total: NPR ${calculatedTotal}`);
      console.log(`   Stored Total: NPR ${order.total_amount}`);
      
      if (Math.abs(calculatedTotal - order.total_amount) < 0.01) {
        console.log('   ✅ Pricing accurate');
      } else {
        console.log('   ❌ Pricing mismatch');
      }
      console.log('');
    });
  }

  // 3. Check settings configuration
  console.log('3️⃣ SETTINGS CONFIGURATION:');
  
  const { data: settings } = await supabase.from('settings').select('*').single();
  
  if (settings) {
    console.log('✅ Settings loaded successfully:');
    console.log(`   Restaurant: ${settings.cafe_name}`);
    console.log(`   Currency: ${settings.currency}`);
    console.log(`   VAT Rate: ${(settings.tax_rate * 100).toFixed(1)}%`);
    console.log(`   Service Charge: ${(settings.service_charge * 100).toFixed(1)}%`);
  } else {
    console.log('❌ Settings not found');
  }

  // 4. Check current system state
  console.log('\n4️⃣ CURRENT SYSTEM STATE:');
  
  const { data: systemSummary } = await supabase.rpc('exec_sql', { 
    sql: `
      SELECT 
        'Tables' as type, COUNT(*) as count, status
      FROM tables 
      GROUP BY status
      UNION ALL
      SELECT 
        'Orders' as type, COUNT(*) as count, status
      FROM orders 
      GROUP BY status
      UNION ALL
      SELECT 
        'Transactions' as type, COUNT(*) as count, 'all' as status
      FROM transactions
    `
  }).catch(() => {
    // If RPC doesn't work, do individual queries
    return { data: null };
  });

  if (!systemSummary?.data) {
    // Manual count
    const { data: allTables } = await supabase.from('tables').select('status');
    const { data: allOrders } = await supabase.from('orders').select('status');
    const { data: allTransactions } = await supabase.from('transactions').select('id');
    
    console.log('📊 System Summary:');
    console.log(`   Tables: ${allTables?.length || 0} total`);
    console.log(`   Orders: ${allOrders?.length || 0} total`);
    console.log(`   Transactions: ${allTransactions?.length || 0} total`);
    
    // Count by status
    const tableStatuses = {};
    allTables?.forEach(t => {
      tableStatuses[t.status] = (tableStatuses[t.status] || 0) + 1;
    });
    
    console.log('   Table Statuses:');
    Object.entries(tableStatuses).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });
  }

  console.log('\n🎉 VERIFICATION COMPLETE');
  console.log('========================');
  console.log('✅ System ready for testing at: http://localhost:9002');
  console.log('✅ Billing page: http://localhost:9002/billing');
  console.log('✅ Test receipt: http://localhost:9002/receipt/5?method=cash');
}

finalSystemVerification().catch(console.error);
