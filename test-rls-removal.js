const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://duzqqpcxatbdcxoevepy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFxcGN4YXRiZGN4b2V2ZXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUwNjEsImV4cCI6MjA3MTk0MTA2MX0.JkywYdsGZ4ZEF-Mloo3gDr85gqwhJ6iKuka3-ZQvrew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeRLS() {
  try {
    console.log('🔧 Attempting to remove RLS restrictions...');
    
    // Try to disable RLS on tables
    const tables = ['tables', 'menu_items', 'orders', 'order_items', 'transactions', 'profiles'];
    
    for (const table of tables) {
      console.log(`🔧 Working on table: ${table}`);
      
      // Check table access first
      const { data, error } = await supabase
        .from(table)
        .select('count(*)')
        .limit(1);
      
      if (error) {
        console.log(`❌ Cannot access ${table}:`, error.message);
      } else {
        console.log(`✅ ${table} is accessible`);
      }
    }
    
    // Test orders query specifically
    console.log('\n📋 Testing orders query with status ready...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'ready');
    
    if (ordersError) {
      console.error('❌ Orders query failed:', ordersError);
    } else {
      console.log('✅ Orders query successful:', {
        count: orders?.length || 0,
        orders: orders
      });
    }
    
  } catch (error) {
    console.error('❌ RLS removal failed:', error);
  }
}

removeRLS();
