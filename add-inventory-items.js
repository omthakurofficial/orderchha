// Local inventory data creator - no database connection needed
'use strict';

// This script will add sample inventory items to the app context (in-memory state)
// You should run this after logging in as admin and then visit the inventory page

// Sample inventory items
const sampleInventoryItems = [
  {
    name: 'Coffee Beans (Arabica)',
    category: 'Beverages',
    stock: 25,
    unit: 'kg',
    purchasePrice: 1200,
    lowStockThreshold: 5
  },
  {
    name: 'Milk',
    category: 'Dairy',
    stock: 50,
    unit: 'ltr',
    purchasePrice: 120,
    lowStockThreshold: 10
  },
  {
    name: 'Sugar',
    category: 'Groceries',
    stock: 30,
    unit: 'kg',
    purchasePrice: 85,
    lowStockThreshold: 8
  },
  {
    name: 'Tea Leaves',
    category: 'Beverages',
    stock: 15,
    unit: 'kg',
    purchasePrice: 950,
    lowStockThreshold: 3
  },
  {
    name: 'Disposable Cups',
    category: 'Supplies',
    stock: 500,
    unit: 'pcs',
    purchasePrice: 5,
    lowStockThreshold: 100
  },
  {
    name: 'Napkins',
    category: 'Supplies',
    stock: 1000,
    unit: 'pcs',
    purchasePrice: 0.5,
    lowStockThreshold: 200
  },
  {
    name: 'Chocolate Syrup',
    category: 'Toppings',
    stock: 12,
    unit: 'ltr',
    purchasePrice: 350,
    lowStockThreshold: 2
  },
  {
    name: 'Vanilla Extract',
    category: 'Flavors',
    stock: 8,
    unit: 'ltr',
    purchasePrice: 450,
    lowStockThreshold: 2
  },
  {
    name: 'Wheat Flour',
    category: 'Baking',
    stock: 40,
    unit: 'kg',
    purchasePrice: 65,
    lowStockThreshold: 10
  },
  {
    name: 'Butter',
    category: 'Dairy',
    stock: 20,
    unit: 'kg',
    purchasePrice: 750,
    lowStockThreshold: 5
  }
];

// Function to add each inventory item using AppContext's addInventoryItem method
function addInventoryItemsToContext() {
  const appContext = window.__ORDERCHHA_APP_CONTEXT__;
  
  if (!appContext || !appContext.addInventoryItem) {
    console.error('App context not found or missing addInventoryItem method.');
    return;
  }
  
  console.log('Adding sample inventory items...');
  
  // Add each inventory item
  sampleInventoryItems.forEach(async (item, index) => {
    setTimeout(async () => {
      try {
        await appContext.addInventoryItem(item);
        console.log(`Added ${item.name} to inventory.`);
      } catch (err) {
        console.error(`Failed to add ${item.name}:`, err);
      }
    }, index * 300); // Add delay between items to avoid any race conditions
  });
  
  console.log('Inventory population initiated!');
}

// Execute the function
addInventoryItemsToContext();
