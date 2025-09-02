// Test script to verify database connection and data
// Run this in your browser console on the app page

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const response = await fetch('/api/test-supabase');
    const result = await response.json();
    console.log('📡 Database connection test:', result);
    
    // Check if data exists
    console.log('📊 Checking data in browser...');
    
    // Check local storage
    const tableOrders = localStorage.getItem('orderchha-table-orders');
    console.log('💾 Local table orders:', tableOrders ? JSON.parse(tableOrders) : 'None');
    
    const transactions = localStorage.getItem('transactions');
    console.log('💰 Local transactions:', transactions ? JSON.parse(transactions) : 'None');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Call the test function
testDatabase();

// Helper functions to manually trigger actions
function refreshData() {
  window.location.reload();
}

function clearLocalData() {
  localStorage.removeItem('orderchha-table-orders');
  localStorage.removeItem('transactions');
  localStorage.removeItem('orderchha-order');
  console.log('🧹 Local data cleared');
}

console.log('🚀 Database test script loaded!');
console.log('💡 Available commands:');
console.log('   - testDatabase() - Test database connection');
console.log('   - refreshData() - Refresh the page');
console.log('   - clearLocalData() - Clear local storage');
