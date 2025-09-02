// Diagnostic script to check what's happening with getBillingReadyOrders
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://duzqqpcxatbdcxoevepy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFxcGN4YXRiZGN4b2V2ZXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUwNjEsImV4cCI6MjA3MTk0MTA2MX0.JkywYdsGZ4ZEF-Mloo3gDr85gqwhJ6iKuka3-ZQvrew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBillingQuery() {
  try {
    console.log('🔍 Testing exact same query as getBillingReadyOrders...');
    
    // This is the exact same query as in src/lib/supabase.ts
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, table_id, status, created_at, total_amount, customer_name, phone, notes,
        order_items (
          id, menu_item_id, quantity, price,
          menu_items (name, image_url, description)
        )
      `)
      .eq('status', 'ready')
      .order('created_at');
    
    console.log('📊 Query Result:', {
      success: !error,
      error: error?.message,
      dataCount: data?.length || 0,
      data: data
    });

    if (data && data.length > 0) {
      console.log('✅ Found orders ready for billing:');
      data.forEach(order => {
        console.log(`  - Order ${order.id}: Table ${order.table_id}, Amount ${order.total_amount}, Status: ${order.status}`);
      });
    } else {
      console.log('❌ No orders found with status "ready"');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBillingQuery();
