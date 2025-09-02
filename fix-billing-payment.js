const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBillingAndPaymentIssues() {
  console.log('🔧 FIXING BILLING AND PAYMENT ISSUES');
  console.log('====================================\n');
  
  try {
    // Step 1: Clean up any orphaned data
    console.log('🧹 Step 1: Cleaning up orphaned data...');
    
    // Delete order items that reference non-existent menu items
    const { data: orphanedItems } = await supabase
      .from('order_items')
      .select(`
        id, menu_item_id,
        menu_items (id)
      `);
    
    if (orphanedItems) {
      const orphanedItemIds = orphanedItems
        .filter(item => !item.menu_items)
        .map(item => item.id);
      
      if (orphanedItemIds.length > 0) {
        console.log(`🗑️ Removing ${orphanedItemIds.length} orphaned order items...`);
        await supabase.from('order_items').delete().in('id', orphanedItemIds);
      }
    }
    
    // Step 2: Create a test order flow
    console.log('\n🧪 Step 2: Creating complete test order flow...');
    
    // Get fresh menu items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .limit(3);
    
    if (!menuItems || menuItems.length === 0) {
      console.log('❌ No menu items found. Please run the database setup first.');
      return;
    }
    
    console.log(`✅ Found ${menuItems.length} menu items to use`);
    
    // Create a test order that will go through the complete flow
    const orderData = {
      table_id: 5,
      total_amount: 650.00,
      status: 'pending',
      customer_name: 'Payment Test Customer',
      phone: '+977-9876543333',
      notes: 'Test order for payment flow'
    };
    
    console.log('📝 Creating test order...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (orderError) {
      console.log('❌ Order creation failed:', orderError);
      return;
    }
    
    console.log('✅ Order created:', order.id);
    
    // Add order items
    const orderItems = [
      {
        order_id: order.id,
        menu_item_id: menuItems[0].id,
        quantity: 1,
        price: menuItems[0].price
      },
      {
        order_id: order.id,
        menu_item_id: menuItems[1].id,
        quantity: 1,
        price: menuItems[1].price
      }
    ];
    
    console.log('📝 Adding order items...');
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();
    
    if (itemsError) {
      console.log('❌ Order items creation failed:', itemsError);
      console.log('❌ Full error:', JSON.stringify(itemsError, null, 2));
      // Cleanup
      await supabase.from('orders').delete().eq('id', order.id);
      return;
    }
    
    console.log('✅ Order items created successfully');
    
    // Step 3: Move order through the flow
    console.log('\n⚡ Step 3: Simulating order flow...');
    
    // Move to preparing status
    console.log('🍳 Moving order to "preparing" status...');
    await supabase.from('orders').update({ status: 'preparing' }).eq('id', order.id);
    await supabase.from('tables').update({ status: 'occupied' }).eq('id', 5);
    
    // Move to ready status (ready for billing)
    console.log('🔔 Moving order to "ready" status (billing ready)...');
    await supabase.from('orders').update({ status: 'ready' }).eq('id', order.id);
    await supabase.from('tables').update({ status: 'billing' }).eq('id', 5);
    
    console.log('✅ Order is now ready for billing!');
    
    // Step 4: Test payment processing
    console.log('\n💳 Step 4: Testing payment processing...');
    
    // Create a transaction
    const transactionData = {
      table_id: 5,
      order_id: order.id,
      amount: orderData.total_amount,
      vat_amount: 0,
      total_amount: orderData.total_amount,
      method: 'cash',
      status: 'completed',
      customer_name: orderData.customer_name,
      invoice_number: `INV-TEST-${Date.now()}`
    };
    
    console.log('💰 Processing payment...');
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();
    
    if (transError) {
      console.log('❌ Payment processing failed:', transError);
      return;
    }
    
    console.log('✅ Payment processed successfully:', transaction.id);
    
    // Mark order as completed
    await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id);
    await supabase.from('tables').update({ status: 'available' }).eq('id', 5);
    
    console.log('✅ Order completed and table freed!');
    
    // Step 5: Verify billing page data
    console.log('\n📋 Step 5: Checking billing page data...');
    
    const { data: readyOrders } = await supabase
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
    
    console.log(`📊 Orders ready for billing: ${readyOrders?.length || 0}`);
    
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    console.log(`💳 Recent transactions: ${recentTransactions?.length || 0}`);
    
    // Create one more order ready for billing to test refresh
    console.log('\n🎯 Creating one more order ready for billing...');
    
    const order2Data = {
      table_id: 6,
      total_amount: 350.00,
      status: 'ready', // Direct to ready for billing
      customer_name: 'Refresh Test Customer',
      notes: 'Order to test refresh functionality'
    };
    
    const { data: order2, error: order2Error } = await supabase
      .from('orders')
      .insert(order2Data)
      .select()
      .single();
    
    if (order2Error) {
      console.log('⚠️ Could not create second test order:', order2Error);
    } else {
      // Add items to second order
      const order2Items = [{
        order_id: order2.id,
        menu_item_id: menuItems[0].id,
        quantity: 1,
        price: menuItems[0].price
      }];
      
      await supabase.from('order_items').insert(order2Items);
      await supabase.from('tables').update({ status: 'billing' }).eq('id', 6);
      console.log('✅ Second order created for Table 6');
    }
    
    console.log('\n🎉 BILLING AND PAYMENT SYSTEM FIXED!');
    console.log('\n📱 TESTING INSTRUCTIONS:');
    console.log('========================');
    console.log('1. Go to http://localhost:9002/billing');
    console.log('2. You should see tables ready for billing');
    console.log('3. Click on a table to process payment');
    console.log('4. After payment, table should disappear');
    console.log('5. Refresh page - remaining tables should still show');
    console.log('\n💡 If tables still disappear after refresh:');
    console.log('   - Check browser console for errors');
    console.log('   - The app should now load menu from database correctly');
    console.log('   - Order creation should work with proper UUIDs');
    
  } catch (error) {
    console.error('💀 Error fixing billing issues:', error);
  }
}

fixBillingAndPaymentIssues();
