require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testIndividualReceiptFunctionality() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables not found');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing individual receipt fixes...');
    
    // Test getting a specific order by ID
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, table_id, total_amount, status, created_at')
      .eq('status', 'completed')
      .limit(3);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }

    console.log(`✅ Found ${orders?.length || 0} completed orders`);

    if (orders && orders.length > 0) {
      const testOrderId = orders[0].id;
      console.log(`🔍 Testing getOrderById for: ${testOrderId}`);
      
      // Test our new getOrderById function
      const { data: specificOrder, error: specificOrderError } = await supabase
        .from('orders')
        .select(`
          id, table_id, status, created_at, total_amount, customer_name, phone, notes,
          order_items (
            id, menu_item_id, quantity, price,
            menu_items (name, image_url, description)
          )
        `)
        .eq('id', testOrderId)
        .single();

      if (specificOrderError) {
        console.error('❌ Error getting specific order:', specificOrderError);
      } else {
        console.log('✅ Successfully retrieved specific order');
        console.log(`   Order ID: ${specificOrder.id}`);
        console.log(`   Table: ${specificOrder.table_id}`);
        console.log(`   Items: ${specificOrder.order_items?.length || 0}`);
        console.log(`   Total: $${specificOrder.total_amount}`);
        
        // Test individual receipt URL
        console.log(`🔗 Individual Receipt URL: http://localhost:9002/receipt/order/${specificOrder.id}`);
      }
    }

    console.log('✅ Individual receipt functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testIndividualReceiptFunctionality();
