const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function investigateOrderDuplication() {
  console.log('🔍 INVESTIGATING ORDER DUPLICATION');
  console.log('==================================\n');

  // Find orders with potential duplication issues
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, table_id, status, total_amount, created_at,
      order_items(
        id, menu_item_id, quantity, price,
        menu_items(name, price)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (orders && orders.length > 0) {
    console.log(`📋 Found ${orders.length} recent orders\n`);
    
    orders.forEach(order => {
      console.log(`📋 Order ${order.id} - Table ${order.table_id} - NPR ${order.total_amount}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Created: ${order.created_at}`);
      console.log(`   Items:`);
      
      if (order.order_items && order.order_items.length > 0) {
        // Check for item calculation accuracy
        let calculatedTotal = 0;
        const itemCounts = {};
        
        order.order_items.forEach((item, index) => {
          const itemTotal = item.quantity * item.price;
          calculatedTotal += itemTotal;
          
          console.log(`     ${index + 1}. ${item.menu_items?.name || 'Unknown'} x${item.quantity} @ NPR ${item.price} = NPR ${itemTotal}`);
          console.log(`        Menu Item ID: ${item.menu_item_id}`);
          console.log(`        Order Item ID: ${item.id}`);
          
          // Track for duplicates
          const key = `${item.menu_item_id}`;
          itemCounts[key] = (itemCounts[key] || 0) + item.quantity;
        });
        
        // Check total accuracy
        if (Math.abs(calculatedTotal - order.total_amount) > 0.01) {
          console.log(`   ⚠️ TOTAL MISMATCH: Calculated NPR ${calculatedTotal}, Stored NPR ${order.total_amount}`);
        } else {
          console.log(`   ✅ Total accurate: NPR ${calculatedTotal}`);
        }
        
        // Check for suspicious duplicates
        Object.entries(itemCounts).forEach(([menuItemId, totalQty]) => {
          const menuItemName = order.order_items.find(i => i.menu_item_id === menuItemId)?.menu_items?.name;
          if (totalQty > 1) {
            console.log(`   📊 ${menuItemName}: Total quantity ${totalQty}`);
          }
        });
        
      } else {
        console.log(`   ⚠️ No items found for this order`);
      }
      console.log('');
    });
  }

  // Specific check for the problematic order (NPR 1200 with Chicken BBQ)
  console.log('🎯 SPECIFIC CHECK FOR CHICKEN BBQ ORDER:');
  const { data: chickenOrders } = await supabase
    .from('order_items')
    .select(`
      id, order_id, menu_item_id, quantity, price,
      menu_items(name, price),
      orders(id, table_id, total_amount, status)
    `)
    .eq('menu_items.name', 'Chicken BBQ');

  if (chickenOrders && chickenOrders.length > 0) {
    console.log(`Found ${chickenOrders.length} Chicken BBQ order items:`);
    chickenOrders.forEach(item => {
      console.log(`   Order ${item.orders?.id} - Table ${item.orders?.table_id}`);
      console.log(`   Quantity: ${item.quantity} @ NPR ${item.price} each`);
      console.log(`   Menu price: NPR ${item.menu_items?.price}`);
      console.log(`   Order total: NPR ${item.orders?.total_amount}`);
      console.log('');
    });
  }
}

investigateOrderDuplication().catch(console.error);
