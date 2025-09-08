'use strict';

// Import the app context module
const { addInventoryItem } = require('./src/context/app-context');

// Sample inventory items
const sampleItems = [
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
  }
];

// Add each item to the inventory
async function addItems() {
  console.log('Adding inventory items...');
  
  for (const item of sampleItems) {
    try {
      await addInventoryItem(item);
      console.log(`Added ${item.name}`);
    } catch (err) {
      console.error(`Failed to add ${item.name}:`, err);
    }
  }
  
  console.log('Done adding inventory items');
}

// Run the function
addItems().catch(console.error);
