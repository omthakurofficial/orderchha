// Browser console script to clear all localStorage data
// Run this in browser console (F12) while on the app page

console.log('🧹 Clearing all localStorage data...');

// Clear all orderchha related data
const keysToRemove = [
  'orderchha-table-orders',
  'orderchha-order', 
  'transactions',
  'orderchha-settings',
  'orderchha-user',
  'orderchha-current-table'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removed ${key}`);
  } else {
    console.log(`⚪ ${key} not found`);
  }
});

// Clear all localStorage (nuclear option)
// localStorage.clear();

console.log('🎉 localStorage cleanup completed!');
console.log('📄 Please refresh the page to see clean state.');
