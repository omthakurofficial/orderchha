const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Using Supabase URL:', supabaseUrl);
console.log('🔑 Using Supabase Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ FATAL: Supabase credentials missing from .env.local file!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabaseIssues() {
  console.log('🔍 COMPREHENSIVE DATABASE DIAGNOSIS FOR ORDERCHHA');
  console.log('====================================================\n');
  
  const requiredTables = [
    'menu_categories',
    'menu_items', 
    'tables',
    'orders',
    'order_items',
    'transactions', // CRITICAL for billing
    'settings',
    'inventory',
    'users'
  ];
  
  let missingTables = [];
  let emptyTables = [];
  let issues = [];
  
  console.log('📋 CHECKING TABLE EXISTENCE AND DATA...\n');
  
  for (const tableName of requiredTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${tableName}: MISSING or ERROR`);
        console.log(`   Error: ${error.message}\n`);
        missingTables.push(tableName);
        
        if (tableName === 'transactions') {
          issues.push('🚨 CRITICAL: transactions table missing - This breaks billing completely!');
        }
        if (tableName === 'menu_items') {
          issues.push('🚨 CRITICAL: menu_items table missing - No menu items will display!');
        }
        if (tableName === 'tables') {
          issues.push('🚨 CRITICAL: tables table missing - No tables will display in billing!');
        }
      } else {
        console.log(`✅ ${tableName}: EXISTS (${count || 0} rows)`);
        if ((count || 0) === 0) {
          emptyTables.push(tableName);
          if (['menu_items', 'tables', 'menu_categories'].includes(tableName)) {
            issues.push(`⚠️ WARNING: ${tableName} is empty - This will cause display issues`);
          }
        }
      }
    } catch (err) {
      console.log(`💀 ${tableName}: FATAL ERROR`);
      console.log(`   ${err.message}\n`);
      missingTables.push(tableName);
    }
  }
  
  console.log('\n🔍 TESTING BILLING-SPECIFIC FUNCTIONALITY...\n');
  
  // Test billing orders query
  try {
    const { data: billingOrders, error: billingError } = await supabase
      .from('orders')
      .select(`
        id, table_id, status, total_amount, created_at,
        order_items (
          id, menu_item_id, quantity, price,
          menu_items (name, image_url, description)
        )
      `)
      .eq('status', 'ready')
      .order('created_at');
    
    if (billingError) {
      console.log('❌ BILLING ORDERS QUERY FAILED:');
      console.log(`   ${billingError.message}\n`);
      issues.push('🚨 CRITICAL: Cannot fetch billing orders - Billing page will be empty!');
    } else {
      console.log(`✅ BILLING ORDERS QUERY: Works (${billingOrders?.length || 0} ready orders)\n`);
    }
  } catch (err) {
    console.log('💀 BILLING ORDERS: FATAL ERROR');
    console.log(`   ${err.message}\n`);
    issues.push('🚨 CRITICAL: Billing orders query completely broken!');
  }
  
  // Test transactions query
  try {
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);
    
    if (transError) {
      console.log('❌ TRANSACTIONS QUERY FAILED:');
      console.log(`   ${transError.message}\n`);
      issues.push('🚨 CRITICAL: Cannot query transactions - Payment processing will fail!');
    } else {
      console.log(`✅ TRANSACTIONS QUERY: Works (${transactions?.length || 0} transactions)\n`);
    }
  } catch (err) {
    console.log('💀 TRANSACTIONS: FATAL ERROR');
    console.log(`   ${err.message}\n`);
    issues.push('🚨 CRITICAL: Transactions completely broken!');
  }
  
  // Test menu items with categories
  try {
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select(`
        id, name, price, image_url, available,
        menu_categories (name)
      `)
      .limit(5);
    
    if (menuError) {
      console.log('❌ MENU ITEMS WITH CATEGORIES FAILED:');
      console.log(`   ${menuError.message}\n`);
      issues.push('⚠️ Menu items query failed - Menu may not display properly');
    } else {
      console.log(`✅ MENU ITEMS QUERY: Works (${menuItems?.length || 0} items)\n`);
    }
  } catch (err) {
    console.log('💀 MENU ITEMS: ERROR');
    console.log(`   ${err.message}\n`);
  }
  
  console.log('\n📊 DIAGNOSIS SUMMARY');
  console.log('====================\n');
  
  if (missingTables.length > 0) {
    console.log('🚨 MISSING TABLES:');
    missingTables.forEach(table => console.log(`   - ${table}`));
    console.log('');
  }
  
  if (emptyTables.length > 0) {
    console.log('⚠️ EMPTY TABLES:');
    emptyTables.forEach(table => console.log(`   - ${table}`));
    console.log('');
  }
  
  if (issues.length > 0) {
    console.log('🔥 CRITICAL ISSUES FOUND:');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('');
  }
  
  console.log('💡 RECOMMENDED ACTIONS:');
  console.log('========================\n');
  
  if (missingTables.includes('transactions')) {
    console.log('1. 🚨 URGENT: Create transactions table');
    console.log('   - Run: sql/complete-database-setup-fixed.sql in Supabase');
    console.log('   - This fixes billing payment processing\n');
  }
  
  if (missingTables.length > 0) {
    console.log('2. 🔧 Setup missing database tables');
    console.log('   - Run the complete database setup script');
    console.log('   - File: sql/complete-database-setup-fixed.sql\n');
  }
  
  if (emptyTables.includes('menu_items') || emptyTables.includes('tables')) {
    console.log('3. 📝 Add sample data to empty tables');
    console.log('   - The setup script includes sample menu items and tables');
    console.log('   - This will make the app functional immediately\n');
  }
  
  if (issues.length === 0 && missingTables.length === 0) {
    console.log('🎉 DATABASE APPEARS HEALTHY!');
    console.log('   - All required tables exist');
    console.log('   - Billing functionality should work');
    console.log('   - Check application code for other issues\n');
  }
  
  console.log('🔗 NEXT STEPS:');
  console.log('==============');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Open SQL Editor');
  console.log('3. Run sql/complete-database-setup-fixed.sql');
  console.log('4. Restart your Next.js application');
  console.log('5. Test billing functionality');
  
  return {
    missingTables,
    emptyTables,
    issues,
    healthy: issues.length === 0 && missingTables.length === 0
  };
}

// Run diagnosis
diagnoseDatabaseIssues()
  .then(result => {
    if (!result.healthy) {
      process.exit(1); // Exit with error code
    }
  })
  .catch(error => {
    console.error('💀 FATAL DIAGNOSIS ERROR:', error);
    process.exit(1);
  });
