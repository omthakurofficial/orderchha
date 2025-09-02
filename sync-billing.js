const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function syncBillingStatus() {
  console.log('🔄 Synchronizing billing status...');
  
  // Get all tables with billing status
  const { data: billingTables } = await supabase.from('tables').select('*').eq('status', 'billing');
  
  for (const table of billingTables || []) {
    // Check if table has any ready orders
    const { data: readyOrders } = await supabase.from('orders').select('*').eq('table_id', table.id).eq('status', 'ready');
    
    if (!readyOrders || readyOrders.length === 0) {
      // No ready orders, reset table to occupied
      await supabase.from('tables').update({ status: 'occupied' }).eq('id', table.id);
      console.log(`✅ Reset Table ${table.id} from billing to occupied (no ready orders)`);
    } else {
      console.log(`✅ Table ${table.id} correctly in billing (has ${readyOrders.length} ready orders)`);
    }
  }
  
  console.log('🎉 Synchronization complete!');
}

syncBillingStatus().catch(console.error);
