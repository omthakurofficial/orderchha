// Add this script to your browser console to add inventory items directly
// Copy the entire script and paste it into the browser console

(function() {
  // Check if app context is available
  const appContext = window?.__APP_CONTEXT__;
  
  if (!appContext || !appContext.addInventoryItem) {
    // Try looking for the function in global scope
    const addInventoryFunc = window?.addInventoryItem;
    
    if (!addInventoryFunc) {
      console.error("❌ ERROR: Could not find the app context or addInventoryItem function!");
      return;
    }
  }
  
  // Sample inventory items
  const inventoryItems = [
    {
      name: "Coffee Beans (Arabica)",
      category: "Beverages",
      stock: 25,
      unit: "kg",
      purchasePrice: 1200,
      lowStockThreshold: 5,
    },
    {
      name: "Milk",
      category: "Dairy",
      stock: 50,
      unit: "ltr",
      purchasePrice: 120, 
      lowStockThreshold: 10,
    },
    {
      name: "Sugar",
      category: "Groceries",
      stock: 30,
      unit: "kg",
      purchasePrice: 85,
      lowStockThreshold: 8,
    },
    {
      name: "Tea Leaves",
      category: "Beverages",
      stock: 15,
      unit: "kg",
      purchasePrice: 950,
      lowStockThreshold: 3,
    },
    {
      name: "Disposable Cups",
      category: "Supplies",
      stock: 500,
      unit: "pcs",
      purchasePrice: 5,
      lowStockThreshold: 100,
    },
  ];

  // Function to add an inventory item directly through React component
  function addInventoryItemDirectly() {
    // Find the Add Item button and click it
    const addItemButton = document.querySelector('[data-testid="add-inventory-dialog-trigger"]');
    if (addItemButton) {
      addItemButton.click();
      console.log("✅ Opened the Add Item dialog");
      
      // Wait for dialog to open
      setTimeout(() => {
        // Get the input fields
        const nameInput = document.querySelector('input[placeholder="e.g., Coffee Beans, Milk"]');
        const categoryInput = document.querySelector('input[placeholder="e.g., Groceries, Drinks, Supplies"]');
        const stockInput = document.querySelectorAll('input[type="number"]')[0];
        const unitSelect = document.querySelector('button[role="combobox"]');
        const priceInput = document.querySelectorAll('input[type="number"]')[1];
        const thresholdInput = document.querySelectorAll('input[type="number"]')[2];
        
        if (!nameInput || !categoryInput || !stockInput || !unitSelect || !priceInput || !thresholdInput) {
          console.error("❌ Could not find all form inputs");
          return;
        }
        
        // Populate the form with sample data
        const item = inventoryItems[0]; // Use first item for demonstration
        nameInput.value = item.name;
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        categoryInput.value = item.category;
        categoryInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        stockInput.value = item.stock.toString();
        stockInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Select unit (this is more complex due to the custom dropdown)
        // For demonstration, we'll click the dropdown and try to select the right option
        unitSelect.click();
        setTimeout(() => {
          const unitOptions = document.querySelectorAll('[role="option"]');
          const unitToSelect = Array.from(unitOptions).find(opt => 
            opt.textContent.toLowerCase().includes(item.unit)
          );
          if (unitToSelect) {
            unitToSelect.click();
          }
        }, 500);
        
        priceInput.value = item.purchasePrice.toString();
        priceInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        thresholdInput.value = item.lowStockThreshold.toString();
        thresholdInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Submit form
        setTimeout(() => {
          const addButton = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent === "Add Item");
            
          if (addButton) {
            addButton.click();
            console.log("✅ Successfully submitted the form with sample data!");
          } else {
            console.error("❌ Could not find the Add Item button");
          }
        }, 1000);
      }, 500);
    } else {
      console.error("❌ Could not find the Add Item button");
    }
  }

  console.log("🚀 Inventory Item Adder Script Loaded!");
  console.log("⚠️ Click the 'Add Item' button on the page to add inventory items");
  
  // Try to find "Add Sample Items" button and click it if available
  const addSampleButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent.includes("Add Sample Items"));
  
  if (addSampleButton) {
    console.log("✅ Found 'Add Sample Items' button - clicking it automatically!");
    addSampleButton.click();
  } else {
    console.log("ℹ️ Could not find 'Add Sample Items' button - trying direct form submission");
    addInventoryItemDirectly();
  }
})();
