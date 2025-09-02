const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixBillingTables() {
  console.log('🔧 FIXING BILLING TABLE STATUS');
  console.log('==============================\n');
  
  // Check tables with billing status but no orders
  const { data: tables } = await supabase.from('tables').select('*').eq('status', 'billing');
  console.log('📊 Tables in billing status:', tables?.length || 0);
  
  if (tables && tables.length > 0) {
    for (const table of tables) {
      console.log(`🪑 Checking Table ${table.id}:`);
      
      // Check if this table has any active orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('table_id', table.id)
        .eq('status', 'ready-for-billing');
      
      console.log(`   📋 Billing orders: ${orders?.length || 0}`);
      
      if (!orders || orders.length === 0) {
        // No billing orders, reset table to available
        console.log(`   🔄 Resetting Table ${table.id} to available status`);
        const { error } = await supabase
          .from('tables')
          .update({ status: 'available' })
          .eq('id', table.id);
          
        if (error) {
          console.log(`   ❌ Error updating table: ${error.message}`);
        } else {
          console.log(`   ✅ Table ${table.id} reset to available`);
        }
      } else {
        console.log(`   ℹ️  Table ${table.id} has ${orders.length} pending billing orders`);
      }
    }
  }
  
  // Check for any orphaned billing orders
  const { data: billingOrders } = await supabase
    .from('orders')
    .select(`
      id, table_id, status, total_amount,
      order_items(
        id, menu_item_id, quantity, price,
        menu_items(name)
      )
    `)
    .eq('status', 'ready-for-billing');
    
  console.log(`\n📋 Total billing-ready orders: ${billingOrders?.length || 0}`);
  
  if (billingOrders && billingOrders.length > 0) {
    console.log('\n💳 BILLING ORDERS DETAILS:');
    billingOrders.forEach(order => {
      console.log(`   Order ${order.id}: Table ${order.table_id} - NPR ${order.total_amount}`);
      console.log(`   Items: ${order.order_items?.length || 0}`);
    });
  }

  // Check system settings for VAT
  console.log('\n⚙️  SYSTEM SETTINGS CHECK:');
  const { data: settings } = await supabase.from('settings').select('*');
  
  if (!settings || settings.length === 0) {
    console.log('❌ No settings found! Creating default settings...');
    
    // Create default settings
    const defaultSettings = [
      { key: 'restaurant_name', value: 'Sips & Slices Corner' },
      { key: 'vat_rate', value: '13' },
      { key: 'service_charge', value: '0' },
      { key: 'currency', value: 'NPR' }
    ];
    
    for (const setting of defaultSettings) {
      const { error } = await supabase.from('settings').insert(setting);
      if (error) {
        console.log(`❌ Error creating setting ${setting.key}:`, error.message);
      } else {
        console.log(`✅ Created setting: ${setting.key} = ${setting.value}`);
      }
    }
  } else {
    console.log('✅ Settings found:');
    settings.forEach(setting => {
      console.log(`   ${setting.key}: ${setting.value}`);
    });
  }
}

fixBillingTables().catch(console.error);
