const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Real restaurant menu data (from data.ts)
const menuCategories = [
  { name: 'Pizzas', icon: '🍕' },
  { name: 'Beverages', icon: '🥤' },
  { name: 'Snacks', icon: '🍿' },
  { name: 'Desserts', icon: '🍰' }
];

const menuItems = {
  'Pizzas': [
    { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, and fresh basil', price: 850, image: '/images/margherita-pizza.jpg', image_hint: 'Classic Italian pizza with fresh basil leaves', in_stock: true },
    { name: 'Pepperoni Pizza', description: 'Pepperoni slices with mozzarella cheese', price: 950, image: '/images/pepperoni-pizza.jpg', image_hint: 'Pizza topped with spicy pepperoni slices', in_stock: true },
    { name: 'Vegetarian Special', description: 'Bell peppers, mushrooms, onions, and olives', price: 900, image: '/images/vegetarian-pizza.jpg', image_hint: 'Colorful pizza with fresh vegetables', in_stock: true }
  ],
  'Beverages': [
    { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 150, image: '/images/orange-juice.jpg', image_hint: 'Glass of fresh orange juice with orange slices', in_stock: true },
    { name: 'Iced Coffee', description: 'Cold brew coffee with ice', price: 180, image: '/images/iced-coffee.jpg', image_hint: 'Tall glass of iced coffee with coffee beans', in_stock: true },
    { name: 'Mango Lassi', description: 'Traditional yogurt-based mango drink', price: 120, image: '/images/mango-lassi.jpg', image_hint: 'Creamy mango lassi with mango garnish', in_stock: true }
  ],
  'Snacks': [
    { name: 'Chicken Momos', description: 'Steamed chicken dumplings (8 pieces)', price: 200, image: '/images/chicken-momos.jpg', image_hint: 'Steamed dumplings with spicy sauce', in_stock: true },
    { name: 'French Fries', description: 'Crispy golden potato fries', price: 120, image: '/images/french-fries.jpg', image_hint: 'Golden crispy fries in a basket', in_stock: true }
  ],
  'Desserts': [
    { name: 'Chocolate Cake', description: 'Rich chocolate layered cake', price: 300, image: '/images/chocolate-cake.jpg', image_hint: 'Decadent chocolate cake slice', in_stock: true },
    { name: 'Vanilla Ice Cream', description: 'Premium vanilla ice cream (2 scoops)', price: 180, image: '/images/vanilla-ice-cream.jpg', image_hint: 'Scoops of vanilla ice cream with wafer', in_stock: true }
  ]
};

// Restaurant tables data (matching actual schema)
const tablesData = [
  { id: 2, name: 'Table 2', location: 'Ground Floor', capacity: 2, status: 'available' },
  { id: 3, name: 'Table 3', location: 'Ground Floor', capacity: 6, status: 'available' },
  { id: 4, name: 'Table 4', location: 'Ground Floor', capacity: 4, status: 'available' },
  { id: 5, name: 'Table 5', location: 'First Floor', capacity: 8, status: 'available' },
  { id: 6, name: 'Table 6', location: 'First Floor', capacity: 2, status: 'available' },
  { id: 7, name: 'Table 7', location: 'First Floor', capacity: 4, status: 'available' },
  { id: 8, name: 'Table 8', location: 'Ground Floor', capacity: 6, status: 'available' },
  { id: 9, name: 'Table 9', location: 'VIP Section', capacity: 10, status: 'available' },
  { id: 10, name: 'Table 10', location: 'Ground Floor', capacity: 4, status: 'available' }
];

// Restaurant settings
const settingsData = {
  cafe_name: 'Sips & Slices Corner',
  address: '123 Food Street, Restaurant District',
  phone: '+977-9841234567',
  logo: '/images/logo.png',
  currency: 'NPR',
  tax_rate: 0.13,
  service_charge: 0.1,
  receipt_note: 'Thank you for dining with us!',
  ai_suggestions_enabled: true,
  online_ordering_enabled: true,
  payment_qr_url: '/images/payment-qr.jpg'
};

async function populateDatabase() {
  console.log('🚀 Starting Supabase data population...');

  try {
    // 1. Insert menu categories
    console.log('📂 Inserting menu categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .insert(menuCategories)
      .select();
    
    if (categoriesError) throw categoriesError;
    console.log('✅ Categories inserted:', categories.length);

    // 2. Insert menu items for each category
    console.log('🍕 Inserting menu items...');
    for (const category of categories) {
      const items = menuItems[category.name] || [];
      const itemsWithCategory = items.map(item => ({
        ...item,
        category_id: category.id
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('menu_items')
        .insert(itemsWithCategory);
      
      if (itemsError) throw itemsError;
      console.log(`✅ ${category.name} items inserted:`, items.length);
    }

    // 3. Insert tables (check existing first)
    console.log('🪑 Checking and inserting tables...');
    const { data: existingTables } = await supabase.from('tables').select('id');
    const existingIds = existingTables?.map(t => t.id) || [];
    
    const newTables = tablesData.filter(table => !existingIds.includes(table.id));
    
    if (newTables.length > 0) {
      const { data: insertedTables, error: tablesError } = await supabase
        .from('tables')
        .insert(newTables);
      
      if (tablesError) throw tablesError;
      console.log('✅ New tables inserted:', newTables.length);
    } else {
      console.log('✅ All tables already exist');
    }

    // 4. Insert or update settings
    console.log('⚙️ Checking and inserting settings...');
    const { data: existingSettings } = await supabase.from('settings').select('*').limit(1);
    
    if (existingSettings?.length === 0) {
      const { data: insertedSettings, error: settingsError } = await supabase
        .from('settings')
        .insert({...settingsData, id: 'app-settings'});
      
      if (settingsError) throw settingsError;
      console.log('✅ Settings inserted');
    } else {
      console.log('✅ Settings already exist');
    }

    console.log('🎉 Database population completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to populate database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

populateDatabase();
