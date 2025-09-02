const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestBillingData() {
  console.log('🧪 Creating test data to demonstrate billing functionality...\n');
  
  try {
    // Get some menu items
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .limit(3);
    
    if (menuError || !menuItems || menuItems.length === 0) {
      console.log('❌ No menu items found. Creating test menu items first...');
      return;
    }
    
    console.log(`✅ Found ${menuItems.length} menu items to use in test orders`);
    
    // Create a few test orders in "ready" status (ready for billing)
    const testOrders = [
      {
        table_id: 1,
        status: 'ready',
        total_amount: 650.00,
        customer_name: 'Test Customer 1',
        phone: '+977-9876543210',
        notes: 'Test order for table 1'
      },
      {
        table_id: 2,
        status: 'ready', 
        total_amount: 450.00,
        customer_name: 'Test Customer 2',
        phone: '+977-9876543211',
        notes: 'Test order for table 2'
      },
      {
        table_id: 3,
        status: 'preparing',
        total_amount: 800.00,
        customer_name: 'Test Customer 3 (Kitchen)',
        phone: '+977-9876543212',
        notes: 'Test order still in kitchen'
      }
    ];
    
    for (let i = 0; i < testOrders.length; i++) {
      const orderData = testOrders[i];
      console.log(`Creating order ${i + 1} for Table ${orderData.table_id}...`);
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (orderError) {
        console.log(`❌ Failed to create order: ${orderError.message}`);
        continue;
      }
      
      console.log(`✅ Order created with ID: ${order.id}`);
      
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
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.log(`⚠️ Failed to add order items: ${itemsError.message}`);
      } else {
        console.log(`✅ Added ${orderItems.length} items to order`);
      }
      
      // Update table status if order is ready for billing
      if (orderData.status === 'ready') {
        await supabase
          .from('tables')
          .update({ status: 'billing' })
          .eq('id', orderData.table_id);
        console.log(`✅ Table ${orderData.table_id} status set to 'billing'`);
      }
      
      console.log('');
    }
    
    // Check current billing-ready orders
    console.log('📋 CHECKING ORDERS READY FOR BILLING...\n');
    
    const { data: billingOrders, error: billingError } = await supabase
      .from('orders')
      .select(`
        id, table_id, status, total_amount, customer_name,
        order_items (
          id, quantity, price,
          menu_items (name)
        )
      `)
      .eq('status', 'ready')
      .order('created_at');
    
    if (billingError) {
      console.log('❌ Error fetching billing orders:', billingError.message);
    } else {
      console.log(`✅ Found ${billingOrders?.length || 0} orders ready for billing:`);
      billingOrders?.forEach(order => {
        console.log(`   - Order ${order.id}: Table ${order.table_id} - ${order.customer_name} - NPR ${order.total_amount}`);
        console.log(`     Items: ${order.order_items?.map(item => `${item.quantity}x ${item.menu_items?.name}`).join(', ')}`);
      });
    }
    
    console.log('\n🎉 Test data created successfully!');
    console.log('\n📱 NOW TEST YOUR BILLING PAGE:');
    console.log('1. Go to http://localhost:9002/billing');
    console.log('2. You should see tables ready for billing');
    console.log('3. Click on a table to process payment');
    console.log('4. After payment, the table should disappear from billing');
    console.log('\nTo create more test orders, run this script again.');
    
  } catch (error) {
    console.error('💀 Error creating test data:', error);
  }
}

createTestBillingData();
