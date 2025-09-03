require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testTransactionEnhancements() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Env vars not found');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing Enhanced Transaction List...');
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('id, table_id, order_id, amount, total_amount, method, created_at')
      .limit(5)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ Found ${transactions?.length || 0} transactions`);
    
    // Analyze transaction types
    const individualOrders = transactions?.filter(t => t.order_id) || [];
    const tableBills = transactions?.filter(t => !t.order_id) || [];
    
    console.log('\n📊 Transaction Summary:');
    console.log(`   Total Transactions: ${transactions?.length || 0}`);
    console.log(`   Individual Orders: ${individualOrders.length}`);
    console.log(`   Table Bills: ${tableBills.length}`);
    
    console.log('\n🔍 Transaction Details:');
    transactions?.forEach((t, index) => {
      console.log(`\n${index + 1}. Transaction: ${t.id}`);
      console.log(`   Table: ${t.table_id}`);
      console.log(`   Order ID: ${t.order_id || 'N/A (Table Bill)'}`);
      console.log(`   Amount: $${t.total_amount || t.amount}`);
      console.log(`   Type: ${t.order_id ? 'Individual Order' : 'Table Bill'}`);
      console.log(`   Receipt URL: ${t.order_id 
        ? `http://localhost:9002/receipt/order/${t.order_id}`
        : `http://localhost:9002/receipt/${t.table_id}?method=${t.method}`
      }`);
    });

    console.log('\n✅ Enhanced transaction list test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTransactionEnhancements();
