#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://tdkekdngxwfvfzfxcntp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRka2VrZG5neHdmdmZ6ZnhjbnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3Mjg1MTMsImV4cCI6MjA0ODMwNDUxM30.zBKCEJ2D7GluvBwHGNmQZVYZCEjlCrYJhFkPFyoHaU0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createIndividualOrderTestData() {
  console.log('🧪 CREATING INDIVIDUAL ORDER TEST DATA');
  console.log('=====================================\n');

  try {
    // Get menu items for test orders
    const { data: menuItems } = await supabase.from('menu_items').select('*').limit(5);
    if (!menuItems || menuItems.length === 0) {
      console.log('❌ No menu items found');
      return;
    }

    console.log(`✅ Found ${menuItems.length} menu items to use`);

    // Create scenario: Table 1 has 4 separate orders (like the user's issue)
    const testOrders = [
      {
        table_id: 1,
        customer_name: 'John Doe',
        items: [
          { menu_item_id: menuItems[0].id, quantity: 1 }, // Chicken BBQ
          { menu_item_id: menuItems[1].id, quantity: 1 }  // Margherita Classic
        ],
        notes: 'First customer order'
      },
      {
        table_id: 1,
        customer_name: 'Jane Smith',
        items: [
          { menu_item_id: menuItems[0].id, quantity: 1 } // Chicken BBQ
        ],
        notes: 'Second customer order'
      },
      {
        table_id: 1,
        customer_name: 'Bob Johnson',
        items: [
          { menu_item_id: menuItems[0].id, quantity: 1 } // Chicken BBQ
        ],
        notes: 'Third customer order'
      },
      {
        table_id: 1,
        customer_name: 'Alice Brown',
        items: [
          { menu_item_id: menuItems[0].id, quantity: 1 } // Chicken BBQ
        ],
        notes: 'Fourth customer order'
      }
    ];

    for (let i = 0; i < testOrders.length; i++) {
      const orderData = testOrders[i];
      console.log(`📋 Creating Order ${i + 1} for Table ${orderData.table_id} (${orderData.customer_name})...`);

      // Calculate total
      let totalAmount = 0;
      for (const item of orderData.items) {
        const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
        if (menuItem) {
          totalAmount += menuItem.price * item.quantity;
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: orderData.table_id,
          status: 'ready', // Ready for billing
          total_amount: totalAmount,
          customer_name: orderData.customer_name,
          notes: orderData.notes
        })
        .select()
        .single();

      if (orderError) {
        console.log(`❌ Error creating order: ${orderError.message}`);
        continue;
      }

      console.log(`✅ Order created: ${order.id} (NPR ${totalAmount})`);

      // Add order items
      for (const item of orderData.items) {
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

          if (!itemError) {
            console.log(`   ✅ Added: ${menuItem.name} x${item.quantity} @ NPR ${menuItem.price}`);
          }
        }
      }
    }

    // Set table status to billing
    await supabase
      .from('tables')
      .update({ status: 'billing' })
      .eq('id', 1);

    console.log(`🪑 Table 1 set to billing status`);

    // Verify the created orders
    console.log('\n🔍 VERIFICATION:');
    const { data: billingOrders } = await supabase
      .from('orders')
      .select(`
        id, table_id, status, total_amount, customer_name,
        order_items(
          quantity, price,
          menu_items(name)
        )
      `)
      .eq('table_id', 1)
      .eq('status', 'ready');

    console.log(`💳 Orders ready for billing on Table 1: ${billingOrders?.length || 0}`);
    
    let totalTableAmount = 0;
    billingOrders?.forEach((order, index) => {
      const orderTotal = order.total_amount || 0;
      totalTableAmount += orderTotal;
      console.log(`   Order ${index + 1}: ${order.customer_name} - NPR ${orderTotal} (${order.order_items?.length} items)`);
      order.order_items?.forEach(item => {
        console.log(`     - ${item.menu_items?.name} x${item.quantity} @ NPR ${item.price}`);
      });
    });

    console.log(`\n📊 SUMMARY:`);
    console.log(`   • Individual Orders: ${billingOrders?.length || 0}`);
    console.log(`   • Table Total if Consolidated: NPR ${totalTableAmount}`);
    console.log(`   • Should allow paying individual orders separately!`);
    console.log(`\n🎯 TEST SCENARIO CREATED:`);
    console.log(`   • Go to billing page and switch to "Individual Orders" view`);
    console.log(`   • You should see 4 separate orders for Table 1`);
    console.log(`   • Each order can be paid separately`);
    console.log(`   • This solves the consolidation issue!`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

createIndividualOrderTestData();
