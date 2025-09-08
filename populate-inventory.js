// Sample inventory data creation
'use strict';

import { config } from 'dotenv';
config();

// This script adds sample inventory items to the database
import { db } from './src/lib/supabase';

const sampleInventoryItems = [
  {
    name: 'Coffee Beans (Arabica)',
    category: 'Beverages',
    stock: 25,
    unit: 'kg',
    purchasePrice: 1200,
    lowStockThreshold: 5,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'Milk',
    category: 'Dairy',
    stock: 50,
    unit: 'ltr',
    purchasePrice: 120,
    lowStockThreshold: 10,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'Sugar',
    category: 'Groceries',
    stock: 30,
    unit: 'kg',
    purchasePrice: 85,
    lowStockThreshold: 8,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'Tea Leaves',
    category: 'Beverages',
    stock: 15,
    unit: 'kg',
    purchasePrice: 950,
    lowStockThreshold: 3,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'Disposable Cups',
    category: 'Supplies',
    stock: 500,
    unit: 'pcs',
    purchasePrice: 5,
    lowStockThreshold: 100,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'Napkins',
    category: 'Supplies',
    stock: 1000,
    unit: 'pcs',
    purchasePrice: 0.5,
    lowStockThreshold: 200,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'Chocolate Syrup',
    category: 'Toppings',
    stock: 12,
    unit: 'ltr',
    purchasePrice: 350,
    lowStockThreshold: 2,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'Vanilla Extract',
    category: 'Flavors',
    stock: 8,
    unit: 'ltr',
    purchasePrice: 450,
    lowStockThreshold: 2,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'Wheat Flour',
    category: 'Baking',
    stock: 40,
    unit: 'kg',
    purchasePrice: 65,
    lowStockThreshold: 10,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'Butter',
    category: 'Dairy',
    stock: 20,
    unit: 'kg',
    purchasePrice: 750,
    lowStockThreshold: 5,
    lastUpdated: new Date().toISOString()
  }
];

async function addInventoryItems() {
  try {
    console.log('Adding sample inventory items...');
    
    for (const item of sampleInventoryItems) {
      // Generate a unique ID for each item
      const id = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Insert into the database
      const { error } = await db
        .from('inventory')
        .insert({
          id,
          name: item.name,
          category: item.category,
          stock: item.stock,
          unit: item.unit,
          purchase_price: item.purchasePrice,
          low_stock_threshold: item.lowStockThreshold,
          last_updated: item.lastUpdated
        });
      
      if (error) {
        console.error(`Error adding item ${item.name}:`, error);
      } else {
        console.log(`Added ${item.name} to inventory.`);
      }
    }
    
    console.log('Inventory population complete!');
  } catch (err) {
    console.error('Failed to populate inventory:', err);
  }
}

// Run the function
addInventoryItems().catch(console.error);
