// Check menu_items table structure
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://duzqqpcxatbdcxoevepy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFxcGN4YXRiZGN4b2V2ZXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUwNjEsImV4cCI6MjA3MTk0MTA2MX0.JkywYdsGZ4ZEF-Mloo3gDr85gqwhJ6iKuka3-ZQvrew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking menu_items table structure...');
    
    // Get one menu item to see available columns
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(1);
    
    if (menuError) {
      console.error('❌ Cannot access menu_items:', menuError);
    } else {
      console.log('✅ menu_items columns:', Object.keys(menuItems[0] || {}));
    }

    console.log('\n🔍 Testing simplified orders query...');
    
    // Test with minimal select
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, table_id, status, total_amount')
      .eq('status', 'ready');
    
    if (ordersError) {
      console.error('❌ Orders query failed:', ordersError);
    } else {
      console.log('✅ Simplified orders query successful:', orders);
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();
