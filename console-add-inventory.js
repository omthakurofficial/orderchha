// Console script to add inventory items
// Run this in the browser console when on the inventory page

function addSampleInventoryItems() {
  // Get the app context from window
  const appContext = window.__APP_CONTEXT__;
  
  if (!appContext || !appContext.addInventoryItem) {
    console.error('App context not found or missing addInventoryItem method');
    return;
  }
  
  // Sample items with proper type assertions
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
  
  // Add each item with delay
  let delay = 0;
  sampleItems.forEach(item => {
    setTimeout(() => {
      // Add item
      appContext.addInventoryItem({
        ...item,
        unit: item.unit
      })
      .then(() => console.log(`Added ${item.name}`))
      .catch(err => console.error(`Failed to add ${item.name}:`, err));
    }, delay);
    
    delay += 300;
  });
  
  console.log('Adding sample inventory items...');
}

// Run the function
addSampleInventoryItems();
