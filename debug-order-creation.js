const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOrderCreation() {
  console.log('🔍 DEBUGGING ORDER CREATION ISSUES');
  console.log('=====================================\n');
  
  try {
    // Check menu items structure in database
    console.log('📋 Checking menu items in database...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price, category_id')
      .limit(5);
    
    if (menuError) {
      console.log('❌ Menu items error:', menuError);
      return;
    }
    
    console.log('✅ Menu items structure:');
    menuItems.forEach(item => {
      console.log(`   - ID: ${item.id} (${typeof item.id}) | Name: ${item.name} | Price: ${item.price}`);
    });
    
    // Test creating a simple order
    console.log('\n🧪 Testing order creation...');
    
    const testOrderData = {
      table_id: 4, // Use table 4 for testing
      total_amount: 450.00,
      status: 'pending',
      customer_name: 'Debug Test Customer',
      notes: 'Debug test order'
    };
    
    console.log('📝 Creating order with data:', testOrderData);
    
    const { data: orderResponse, error: orderError } = await supabase
      .from('orders')
      .insert(testOrderData)
      .select()
      .single();
    
    if (orderError) {
      console.log('❌ Order creation failed:', orderError);
      console.log('❌ Full error:', JSON.stringify(orderError, null, 2));
      return;
    }
    
    console.log('✅ Order created successfully:', orderResponse);
    
    // Test creating order items
    console.log('\n🧪 Testing order items creation...');
    
    const testOrderItems = [
      {
        order_id: orderResponse.id,
        menu_item_id: menuItems[0].id,
        quantity: 2,
        price: menuItems[0].price
      },
      {
        order_id: orderResponse.id,
        menu_item_id: menuItems[1].id,
        quantity: 1,
        price: menuItems[1].price
      }
    ];
    
    console.log('📝 Creating order items with data:', testOrderItems);
    
    const { data: itemsResponse, error: itemsError } = await supabase
      .from('order_items')
      .insert(testOrderItems)
      .select();
    
    if (itemsError) {
      console.log('❌ Order items creation failed:', itemsError);
      console.log('❌ Full error:', JSON.stringify(itemsError, null, 2));
      
      // Try to clean up the order
      await supabase.from('orders').delete().eq('id', orderResponse.id);
      return;
    }
    
    console.log('✅ Order items created successfully:', itemsResponse);
    
    // Now simulate the complete order flow
    console.log('\n🧪 Testing complete order flow...');
    
    // Move order to ready status (for billing)
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'ready' })
      .eq('id', orderResponse.id);
    
    if (updateError) {
      console.log('❌ Failed to update order status:', updateError);
    } else {
      console.log('✅ Order moved to "ready" status');
    }
    
    // Update table status to billing
    const { error: tableError } = await supabase
      .from('tables')
      .update({ status: 'billing' })
      .eq('id', testOrderData.table_id);
    
    if (tableError) {
      console.log('❌ Failed to update table status:', tableError);
    } else {
      console.log('✅ Table status updated to "billing"');
    }
    
    // Check if it shows up in billing orders
    console.log('\n📋 Checking if order appears in billing...');
    
    const { data: billingCheck, error: billingCheckError } = await supabase
      .from('orders')
      .select(`
        id, table_id, status, total_amount,
        order_items (
          id, menu_item_id, quantity, price,
          menu_items (name)
        )
      `)
      .eq('status', 'ready')
      .order('created_at');
    
    if (billingCheckError) {
      console.log('❌ Billing check failed:', billingCheckError);
    } else {
      console.log(`✅ Found ${billingCheck?.length || 0} orders ready for billing`);
      billingCheck?.forEach(order => {
        console.log(`   - Order ${order.id}: Table ${order.table_id} - NPR ${order.total_amount}`);
        console.log(`     Items: ${order.order_items?.map(item => `${item.quantity}x ${item.menu_items?.name || 'Unknown'}`).join(', ')}`);
      });
    }
    
    console.log('\n🎉 DEBUG COMPLETE - Order creation flow works!');
    console.log('\n💡 Next steps:');
    console.log('1. Refresh your billing page: http://localhost:9002/billing');
    console.log('2. You should see Table 4 ready for billing');
    console.log('3. Try processing the payment');
    
  } catch (error) {
    console.error('💀 Fatal error during debug:', error);
  }
}

debugOrderCreation();
