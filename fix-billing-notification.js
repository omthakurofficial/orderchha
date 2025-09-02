const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixBillingNotificationIssue() {
  console.log('🔧 FIXING BILLING NOTIFICATION ISSUE');
  console.log('===================================\n');

  // 1. Check current table statuses
  console.log('1️⃣ TABLE STATUS CHECK:');
  const { data: tables } = await supabase.from('tables').select('*').order('id');
  
  if (tables) {
    tables.forEach(table => {
      console.log(`🪑 Table ${table.id}: ${table.status}`);
    });
  }

  // 2. Check orders for each table status
  console.log('\n2️⃣ ORDERS CHECK BY STATUS:');
  const { data: allOrders } = await supabase
    .from('orders')
    .select('id, table_id, status, total_amount')
    .order('created_at', { ascending: false });

  const ordersByStatus = {};
  allOrders?.forEach(order => {
    if (!ordersByStatus[order.status]) ordersByStatus[order.status] = [];
    ordersByStatus[order.status].push(order);
  });

  Object.entries(ordersByStatus).forEach(([status, orders]) => {
    console.log(`📋 ${status}: ${orders.length} orders`);
  });

  // 3. Find tables with billing status but no ready orders
  console.log('\n3️⃣ BILLING STATUS MISMATCH:');
  const billingTables = tables?.filter(t => t.status === 'billing') || [];
  console.log(`📊 Tables in billing status: ${billingTables.length}`);

  for (const table of billingTables) {
    const ordersForTable = allOrders?.filter(o => o.table_id === table.id && o.status === 'ready') || [];
    console.log(`🪑 Table ${table.id}: ${ordersForTable.length} ready orders`);
    
    if (ordersForTable.length === 0) {
      console.log(`   ⚠️ Table ${table.id} has billing status but no ready orders - FIXING`);
      
      // Reset table to available
      const { error } = await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('id', table.id);
        
      if (error) {
        console.log(`   ❌ Error resetting table: ${error.message}`);
      } else {
        console.log(`   ✅ Table ${table.id} reset to available`);
      }
    }
  }

  // 4. Create a proper test billing order
  console.log('\n4️⃣ CREATING PROPER TEST BILLING ORDER:');
  const { data: menuItems } = await supabase.from('menu_items').select('*').limit(2);
  
  if (menuItems && menuItems.length >= 2) {
    const testTableId = 5; // Use table 5 for testing
    
    console.log(`📋 Creating test order for Table ${testTableId}...`);
    
    // Calculate total
    const totalAmount = menuItems[0].price + menuItems[1].price;
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: testTableId,
        status: 'ready',
        total_amount: totalAmount,
        customer_name: `Customer Table ${testTableId}`
      })
      .select()
      .single();

    if (orderError) {
      console.log(`❌ Error creating order: ${orderError.message}`);
    } else {
      console.log(`✅ Order created: ${order.id} (NPR ${totalAmount})`);

      // Add order items
      for (let i = 0; i < 2; i++) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            menu_item_id: menuItems[i].id,
            quantity: 1,
            price: menuItems[i].price
          });

        if (!itemError) {
          console.log(`   ✅ Added: ${menuItems[i].name} @ NPR ${menuItems[i].price}`);
        }
      }

      // Set table status to billing
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'billing' })
        .eq('id', testTableId);

      if (!tableError) {
        console.log(`🪑 Table ${testTableId} set to billing status`);
      }
    }
  }

  // 5. Final verification
  console.log('\n5️⃣ FINAL VERIFICATION:');
  const { data: finalBillingOrders } = await supabase
    .from('orders')
    .select(`
      id, table_id, status, total_amount,
      order_items(id)
    `)
    .eq('status', 'ready');

  console.log(`💳 Ready orders: ${finalBillingOrders?.length || 0}`);
  finalBillingOrders?.forEach(order => {
    console.log(`   Table ${order.table_id}: NPR ${order.total_amount} (${order.order_items?.length} items)`);
  });

  const { data: finalTables } = await supabase.from('tables').select('*').eq('status', 'billing');
  console.log(`🪑 Tables in billing status: ${finalTables?.length || 0}`);
}

fixBillingNotificationIssue().catch(console.error);
