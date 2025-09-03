require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test script to verify individual receipt functionality
async function testIndividualReceipt() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables not found');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing individual receipt functionality...');
    
    // Test 1: Check if we can fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        table_id,
        total_amount,
        status,
        created_at,
        order_items (
          id,
          quantity,
          price,
          menu_items (
            name,
            price
          )
        )
      `)
      .eq('status', 'completed')
      .limit(5);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }

    console.log(`✅ Found ${orders?.length || 0} completed orders`);

    if (orders && orders.length > 0) {
      const testOrder = orders[0];
      console.log('📋 Test Order Details:');
      console.log(`   ID: ${testOrder.id}`);
      console.log(`   Table: ${testOrder.table_id}`);
      console.log(`   Total: $${testOrder.total_amount}`);
      console.log(`   Items: ${testOrder.order_items?.length || 0}`);
      
      // Test individual receipt URL format
      const receiptUrl = `/receipt/order/${testOrder.id}`;
      console.log(`🔗 Individual Receipt URL: ${receiptUrl}`);
      
      // Test transaction lookup
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .contains('orderIds', [testOrder.id])
        .limit(1);

      if (transactionsError) {
        console.warn('⚠️  Transaction lookup error:', transactionsError);
      } else {
        console.log(`💳 Found ${transactions?.length || 0} transactions for this order`);
      }
    }

    console.log('✅ Individual receipt test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testIndividualReceipt();
