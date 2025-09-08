// Simple script to add inventory items from browser console
(function() {
  console.log("🚀 Adding inventory items...");

  // Sample inventory items with correct unit types
  const items = [
    {
      name: "Coffee Beans (Arabica)",
      category: "Beverages",
      stock: 25,
      unit: "kg",
      purchasePrice: 1200,
      lowStockThreshold: 5
    },
    {
      name: "Milk",
      category: "Dairy",
      stock: 50,
      unit: "ltr",
      purchasePrice: 120,
      lowStockThreshold: 10
    },
    {
      name: "Sugar",
      category: "Groceries",
      stock: 30,
      unit: "kg",
      purchasePrice: 85,
      lowStockThreshold: 8
    },
    {
      name: "Tea Leaves",
      category: "Beverages",
      stock: 15,
      unit: "kg",
      purchasePrice: 950,
      lowStockThreshold: 3
    },
    {
      name: "Disposable Cups",
      category: "Supplies",
      stock: 500,
      unit: "pcs",
      purchasePrice: 5,
      lowStockThreshold: 100
    }
  ];

  // Access app context directly
  const useAppContext = window.__NEXT_DATA__?.props?.pageProps?.useApp;
  
  if (useAppContext && useAppContext.addInventoryItem) {
    // Method 1: Use context function directly
    items.forEach((item, index) => {
      setTimeout(() => {
        useAppContext.addInventoryItem(item);
        console.log(`Added ${item.name}`);
      }, index * 300);
    });
    console.log("✅ Items being added through app context!");
    return;
  }
  
  // Method 2: Click the Add Sample Items button if it exists
  const addSampleButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent.includes("Add Sample Items"));
  
  if (addSampleButton) {
    console.log("✅ Found 'Add Sample Items' button - clicking it!");
    addSampleButton.click();
    return;
  }

  // Method 3: Simple object injection to window.__APP_CONTEXT__
  if (window.__APP_CONTEXT__ && window.__APP_CONTEXT__.addInventoryItem) {
    items.forEach((item, index) => {
      setTimeout(() => {
        window.__APP_CONTEXT__.addInventoryItem(item);
        console.log(`Added ${item.name}`);
      }, index * 300);
    });
    console.log("✅ Items being added through window.__APP_CONTEXT__!");
    return;
  }

  console.log("❌ Could not add inventory items automatically. Please use the UI buttons instead.");
  console.log("Try clicking the 'Add Sample Items' or 'Add Item' buttons on the page.");
})();
