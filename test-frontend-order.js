// Frontend Order Creation Test
// Paste this into browser console to test order creation with real menu IDs

(async function testFrontendOrderCreation() {
  console.log('🧪 TESTING FRONTEND ORDER CREATION WITH REAL MENU IDS');
  console.log('==============================================\n');
  
  // Get app context
  const appContext = window.React?.useContext?.();
  
  if (!appContext) {
    console.log('❌ Could not access app context. Test manually by:');
    console.log('1. Add items to a table cart');
    console.log('2. Go to confirm order page');
    console.log('3. Click approve order');
    console.log('4. Check console for errors');
    return;
  }
  
  console.log('✅ Testing menu data structure...');
  
  // Check if menu has real database IDs or hardcoded ones
  const { menu } = appContext;
  if (menu && menu.length > 0) {
    const firstCategory = menu[0];
    const firstItem = firstCategory.items?.[0];
    
    if (firstItem) {
      console.log('Menu item ID format:', firstItem.id);
      console.log('Menu item name:', firstItem.name);
      
      if (firstItem.id.length > 10) {
        console.log('✅ Menu is using database UUIDs - Order creation should work!');
      } else {
        console.log('❌ Menu still using hardcoded IDs - Order creation will fail');
        console.log('   Need to refresh app or check menu loading function');
      }
    }
  } else {
    console.log('⚠️ No menu data found');
  }
  
  console.log('\n📱 Manual testing steps:');
  console.log('1. Go to http://localhost:9002');
  console.log('2. Click on a table');
  console.log('3. Add items to cart');
  console.log('4. Go to confirm order');
  console.log('5. Click "Approve" - should work now!');
  console.log('6. Go to billing page');
  console.log('7. Process payment');
  console.log('8. Refresh billing page - other tables should remain');
})();
