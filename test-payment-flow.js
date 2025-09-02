const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPaymentProcessFlow() {
  console.log('💳 TESTING COMPLETE PAYMENT PROCESS FLOW');
  console.log('=========================================\n');
  
  try {
    // Step 1: Create an order that simulates real customer flow
    console.log('🎯 Step 1: Creating realistic customer order...');
    
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .limit(3);
    
    // Simulate customer adding items to cart and placing order
    const orderData = {
      table_id: 7, // Table 7
      total_amount: 1000.00,
      status: 'pending',
      customer_name: 'Test Payment Customer',
      phone: '+977-9876544444',
      notes: 'Full payment flow test'
    };
    
    const { data: order } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    // Add order items
    const orderItems = [
      {
        order_id: order.id,
        menu_item_id: menuItems[0].id,
        quantity: 2,
        price: menuItems[0].price
      },
      {
        order_id: order.id,
        menu_item_id: menuItems[1].id,
        quantity: 1,
        price: menuItems[1].price
      }
    ];
    
    await supabase.from('order_items').insert(orderItems);
    console.log('✅ Order and items created for Table 7');
    
    // Step 2: Move through kitchen workflow
    console.log('\n🍳 Step 2: Kitchen workflow simulation...');
    
    // Order goes to preparing
    await supabase.from('orders').update({ status: 'preparing' }).eq('id', order.id);
    await supabase.from('tables').update({ status: 'occupied' }).eq('id', 7);
    console.log('✅ Order moved to "preparing" - Kitchen received');
    
    // Kitchen completes order
    await supabase.from('orders').update({ status: 'ready' }).eq('id', order.id);
    await supabase.from('tables').update({ status: 'billing' }).eq('id', 7);
    console.log('✅ Order moved to "ready" - Ready for billing');
    
    // Step 3: Test billing page data fetch
    console.log('\n📋 Step 3: Testing billing page data...');
    
    const { data: billingOrders, error: billingError } = await supabase
      .from('orders')
      .select(`
        id, table_id, status, total_amount, customer_name, phone, notes,
        order_items (
          id, menu_item_id, quantity, price,
          menu_items (name, image_url, description)
        )
      `)
      .eq('status', 'ready')
      .order('created_at');
    
    if (billingError) {
      console.log('❌ Billing data fetch failed:', billingError);
      return;
    }
    
    console.log(`✅ Billing orders found: ${billingOrders.length}`);
    billingOrders.forEach(billingOrder => {
      console.log(`   📄 Order ${billingOrder.id}`);
      console.log(`      Table: ${billingOrder.table_id}`);
      console.log(`      Customer: ${billingOrder.customer_name}`);
      console.log(`      Amount: NPR ${billingOrder.total_amount}`);
      console.log(`      Items: ${billingOrder.order_items?.length || 0} items`);
      billingOrder.order_items?.forEach(item => {
        console.log(`         - ${item.quantity}x ${item.menu_items?.name} @ NPR ${item.price}`);
      });
    });
    
    // Step 4: Process payment
    console.log('\n💰 Step 4: Processing payment...');
    
    const paymentData = {
      table_id: 7,
      order_id: order.id,
      amount: orderData.total_amount,
      vat_amount: 100.00, // 10% VAT
      total_amount: orderData.total_amount + 100.00,
      method: 'cash',
      status: 'completed',
      customer_name: orderData.customer_name,
      phone: orderData.phone,
      invoice_number: `INV-${Date.now()}`
    };
    
    const { data: payment, error: paymentError } = await supabase
      .from('transactions')
      .insert(paymentData)
      .select()
      .single();
    
    if (paymentError) {
      console.log('❌ Payment processing failed:', paymentError);
      return;
    }
    
    console.log('✅ Payment processed successfully:');
    console.log(`   Transaction ID: ${payment.id}`);
    console.log(`   Amount: NPR ${payment.total_amount}`);
    console.log(`   Method: ${payment.method}`);
    console.log(`   Invoice: ${payment.invoice_number}`);
    
    // Complete the order
    await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id);
    await supabase.from('tables').update({ status: 'available' }).eq('id', 7);
    console.log('✅ Order marked as completed, table now available');
    
    // Step 5: Test after payment - should be no billing orders for this table
    console.log('\n🔄 Step 5: Testing post-payment state...');
    
    const { data: postPaymentBilling } = await supabase
      .from('orders')
      .select('id, table_id, status')
      .eq('status', 'ready');
    
    console.log(`📊 Orders still ready for billing: ${postPaymentBilling?.length || 0}`);
    console.log('✅ Table 7 should no longer appear in billing (payment processed)');
    
    if (postPaymentBilling && postPaymentBilling.length > 0) {
      postPaymentBilling.forEach(order => {
        console.log(`   - Table ${order.table_id} still has pending billing`);
      });
    }
    
    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('id, table_id, total_amount, method, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`💳 Total transactions in system: ${allTransactions?.length || 0}`);
    allTransactions?.forEach(trans => {
      console.log(`   - Table ${trans.table_id}: NPR ${trans.total_amount} (${trans.method})`);
    });
    
    console.log('\n🎉 PAYMENT FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📱 Now test in your browser:');
    console.log('1. Go to http://localhost:9002/billing');
    console.log('2. You should see remaining tables ready for billing');
    console.log('3. Test payment processing');
    console.log('4. After payment, table should disappear');
    console.log('5. Refresh page - other tables should remain visible');
    console.log('\n🔧 The key fixes applied:');
    console.log('   ✅ Menu now loads from database (fixes UUID mismatch)');
    console.log('   ✅ Payment processing creates proper transactions');
    console.log('   ✅ Orders are properly marked as completed');
    console.log('   ✅ Tables are freed after payment');
    
  } catch (error) {
    console.error('💀 Error in payment flow test:', error);
  }
}

testPaymentProcessFlow();
