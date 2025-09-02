const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function diagnoseAllIssues() {
  console.log('🔍 COMPREHENSIVE SYSTEM DIAGNOSIS');
  console.log('==================================\n');

  // 1. Check Database Connectivity
  console.log('1️⃣ DATABASE CONNECTIVITY:');
  try {
    const { data, error } = await supabase.from('menu_categories').select('count');
    if (error) throw error;
    console.log('✅ Database connection working');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return;
  }

  // 2. Check Menu Data & Pricing
  console.log('\n2️⃣ MENU DATA & PRICING:');
  try {
    const { data: categories } = await supabase.from('menu_categories').select('*');
    const { data: items } = await supabase.from('menu_items').select('*');
    
    console.log(`📊 Categories: ${categories?.length || 0}`);
    console.log(`📊 Menu Items: ${items?.length || 0}`);
    
    if (items && items.length > 0) {
      console.log('\n💰 PRICING ANALYSIS:');
      items.forEach(item => {
        const price = parseFloat(item.price);
        if (isNaN(price) || price <= 0) {
          console.log(`⚠️  Invalid price for ${item.name}: ${item.price}`);
        } else {
          console.log(`✅ ${item.name}: NPR ${price}`);
        }
      });
    }
  } catch (error) {
    console.log('❌ Menu data check failed:', error.message);
  }

  // 3. Check Orders & Billing Status
  console.log('\n3️⃣ ORDERS & BILLING STATUS:');
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id, table_id, status, total_amount, created_at,
        order_items(
          id, menu_item_id, quantity, price,
          menu_items(name, price)
        )
      `)
      .order('created_at', { ascending: false });

    if (orders && orders.length > 0) {
      console.log(`📋 Total Orders: ${orders.length}`);
      
      const statusCounts = {};
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      
      console.log('📊 Order Status Distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} orders`);
      });

      // Check billing-ready orders specifically
      const billingReady = orders.filter(order => order.status === 'ready-for-billing');
      console.log(`\n💳 Billing Ready Orders: ${billingReady.length}`);
      billingReady.forEach(order => {
        console.log(`   Table ${order.table_id}: NPR ${order.total_amount} (${order.order_items?.length || 0} items)`);
      });

      // Check for pricing inconsistencies
      console.log('\n🔍 PRICING CONSISTENCY CHECK:');
      orders.forEach(order => {
        if (order.order_items) {
          let calculatedTotal = 0;
          order.order_items.forEach(item => {
            const itemTotal = item.quantity * item.price;
            calculatedTotal += itemTotal;
            
            // Check if order item price matches menu item price
            if (item.menu_items && item.menu_items.price !== item.price) {
              console.log(`⚠️  Price mismatch in order ${order.id}:`);
              console.log(`     ${item.menu_items.name}: Menu price NPR ${item.menu_items.price}, Order price NPR ${item.price}`);
            }
          });
          
          if (Math.abs(calculatedTotal - order.total_amount) > 0.01) {
            console.log(`⚠️  Total amount mismatch in order ${order.id}:`);
            console.log(`     Calculated: NPR ${calculatedTotal}, Stored: NPR ${order.total_amount}`);
          }
        }
      });
    } else {
      console.log('⚠️ No orders found in database');
    }
  } catch (error) {
    console.log('❌ Orders check failed:', error.message);
  }

  // 4. Check Tables Configuration
  console.log('\n4️⃣ TABLES CONFIGURATION:');
  try {
    const { data: tables } = await supabase.from('tables').select('*');
    
    if (tables && tables.length > 0) {
      console.log(`🪑 Total Tables: ${tables.length}`);
      tables.forEach(table => {
        console.log(`   Table ${table.id}: ${table.name} - ${table.status} (${table.capacity} seats)`);
      });
    } else {
      console.log('⚠️ No tables found in database');
    }
  } catch (error) {
    console.log('❌ Tables check failed:', error.message);
  }

  // 5. Check Transactions
  console.log('\n5️⃣ PAYMENT TRANSACTIONS:');
  try {
    const { data: transactions } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    
    if (transactions && transactions.length > 0) {
      console.log(`💰 Total Transactions: ${transactions.length}`);
      transactions.slice(0, 5).forEach(txn => {
        console.log(`   ${txn.created_at}: Table ${txn.table_id} - NPR ${txn.total_amount} (${txn.method})`);
      });
    } else {
      console.log('⚠️ No transactions found');
    }
  } catch (error) {
    console.log('❌ Transactions check failed:', error.message);
  }

  // 6. Check Settings
  console.log('\n6️⃣ SYSTEM SETTINGS:');
  try {
    const { data: settings } = await supabase.from('settings').select('*');
    
    if (settings && settings.length > 0) {
      settings.forEach(setting => {
        console.log(`⚙️  ${setting.key}: ${setting.value}`);
      });
    } else {
      console.log('⚠️ No settings found - this could affect VAT calculations');
    }
  } catch (error) {
    console.log('❌ Settings check failed:', error.message);
  }

  console.log('\n🎯 ISSUE SUMMARY:');
  console.log('================');
  console.log('Issues to investigate:');
  console.log('• Auto-logout after refresh (authentication persistence)');
  console.log('• Billing tables not showing after table selection');
  console.log('• Notification badge showing incorrect count');
  console.log('• Hydration mismatch errors affecting performance');
  console.log('• Pricing calculation consistency');
  console.log('\nNext steps: Fix authentication state management and billing display logic');
}

diagnoseAllIssues().catch(console.error);
