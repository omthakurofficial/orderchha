const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testOrderCreation() {
  console.log('Testing order creation...');
  
  // Test data
  const orderData = {
    table_id: 1,
    status: 'pending',
    total_amount: 100
  };
  
  const orderItems = [
    {
      menu_item_id: 'pizza-margherita',
      quantity: 1,
      price: 299
    }
  ];
  
  try {
    // First check if menu items exist
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(5);
      
    console.log('Menu items check:', menuItems, menuError);
    
    // Test order creation
    console.log('Creating order with data:', orderData);
    const { data: orderResponse, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (orderError) {
      console.error('Order creation error details:', JSON.stringify(orderError, null, 2));
      return;
    }
    
    console.log('Order created successfully:', orderResponse);
    
    // Test order items creation
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: orderResponse.id
    }));
    
    console.log('Creating order items with data:', itemsWithOrderId);
    const { data: itemsResponse, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)
      .select();
    
    if (itemsError) {
      console.error('Order items creation error details:', JSON.stringify(itemsError, null, 2));
      return;
    }
    
    console.log('Order items created successfully:', itemsResponse);
    
    // Clean up the test data
    await supabase.from('order_items').delete().eq('order_id', orderResponse.id);
    await supabase.from('orders').delete().eq('id', orderResponse.id);
    console.log('Test data cleaned up');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testOrderCreation();
