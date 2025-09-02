const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestBillingOrders() {
  console.log('🧪 CREATING TEST BILLING ORDERS');
  console.log('===============================\n');

  // Get menu items for test orders
  const { data: menuItems } = await supabase.from('menu_items').select('*').limit(5);
  if (!menuItems || menuItems.length === 0) {
    console.log('❌ No menu items found');
    return;
  }

  const testOrders = [
    {
      table_id: 3,
      items: [
        { menu_item_id: menuItems[0].id, quantity: 2 },
        { menu_item_id: menuItems[1].id, quantity: 1 }
      ]
    },
    {
      table_id: 7,
      items: [
        { menu_item_id: menuItems[2].id, quantity: 1 },
        { menu_item_id: menuItems[3].id, quantity: 3 }
      ]
    }
  ];

  for (const testOrder of testOrders) {
    try {
      console.log(`📋 Creating order for Table ${testOrder.table_id}...`);

      // Calculate total
      let totalAmount = 0;
      for (const item of testOrder.items) {
        const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
        if (menuItem) {
          totalAmount += menuItem.price * item.quantity;
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: testOrder.table_id,
          status: 'ready', // Use 'ready' status for billing
          total_amount: totalAmount,
          customer_name: `Customer Table ${testOrder.table_id}`
        })
        .select()
        .single();

      if (orderError) {
        console.log(`❌ Error creating order: ${orderError.message}`);
        continue;
      }

      console.log(`✅ Order created: ${order.id} (NPR ${totalAmount})`);

      // Add order items
      for (const item of testOrder.items) {
        const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
        if (menuItem) {
          const { error: itemError } = await supabase
            .from('order_items')
            .insert({
              order_id: order.id,
              menu_item_id: item.menu_item_id,
              quantity: item.quantity,
              price: menuItem.price
            });

          if (itemError) {
            console.log(`❌ Error adding item: ${itemError.message}`);
          } else {
            console.log(`   ✅ Added: ${menuItem.name} x${item.quantity}`);
          }
        }
      }

      // Update table status
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'billing' })
        .eq('id', testOrder.table_id);

      if (tableError) {
        console.log(`⚠️ Could not update table status: ${tableError.message}`);
      } else {
        console.log(`🪑 Table ${testOrder.table_id} set to billing status`);
      }

    } catch (error) {
      console.log(`❌ Error creating test order: ${error.message}`);
    }
  }

  // Verify billing orders
  console.log('\n🔍 VERIFICATION:');
  const { data: billingOrders } = await supabase
    .from('orders')
    .select(`
      id, table_id, status, total_amount,
      order_items(
        quantity, price,
        menu_items(name)
      )
    `)
    .eq('status', 'ready');

  console.log(`💳 Billing-ready orders: ${billingOrders?.length || 0}`);
  billingOrders?.forEach(order => {
    console.log(`   Table ${order.table_id}: NPR ${order.total_amount} (${order.order_items?.length} items)`);
  });
}

createTestBillingOrders().catch(console.error);
