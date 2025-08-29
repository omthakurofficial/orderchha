// MongoDB Data Migration Script
// This script migrates fake data to real MongoDB collections

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://omthakurcloudengineer:POqBpMotyOmoFtzg@orderchha-cluster.hwbuc8f.mongodb.net/orderchha?retryWrites=true&w=majority';

// Define the data inline since we can't import from TypeScript files
const MENU = [
  {
    id: 'pizza',
    name: 'Pizzas',
    icon: 'Flame',
    items: [
      { id: 'p1', name: 'Margherita', description: 'Classic cheese and tomato', price: 12.50, image: 'https://placehold.co/600x400.png', imageHint: 'margherita pizza', inStock: true },
      { id: 'p2', name: 'Pepperoni', description: 'Loaded with spicy pepperoni', price: 14.00, image: 'https://placehold.co/600x400.png', imageHint: 'pepperoni pizza', inStock: true },
      { id: 'p3', name: 'Veggie Supreme', description: 'A garden on a pizza', price: 13.50, image: 'https://placehold.co/600x400.png', imageHint: 'vegetable pizza', inStock: true },
      { id: 'p4', name: 'Quattro Formaggi', description: 'Four cheese delight', price: 15.00, image: 'https://placehold.co/600x400.png', imageHint: 'four cheese', inStock: false },
      { id: 'p5', name: 'Spicy Inferno', description: 'For the brave and bold', price: 15.50, image: 'https://placehold.co/600x400.png', imageHint: 'spicy pizza', inStock: true },
    ],
  },
  {
    id: 'salads',
    name: 'Salads', 
    icon: 'Salad',
    items: [
        { id: 's1', name: 'Caesar Salad', description: 'Crisp romaine, croutons, and parmesan', price: 9.00, image: 'https://placehold.co/600x400.png', imageHint: 'caesar salad', inStock: true },
        { id: 's2', name: 'Greek Salad', description: 'Feta, olives, and fresh vegetables', price: 9.50, image: 'https://placehold.co/600x400.png', imageHint: 'greek salad', inStock: true },
    ]
  },
  {
    id: 'snacks',
    name: 'Snacks',
    icon: 'Pizza',
    items: [
        { id: 'sn1', name: 'French Fries', description: 'Crispy golden fries', price: 4.50, image: 'https://placehold.co/600x400.png', imageHint: 'french fries', inStock: true },
        { id: 'sn2', name: 'Mozzarella Sticks', description: 'Served with marinara sauce', price: 6.00, image: 'https://placehold.co/600x400.png', imageHint: 'mozzarella sticks', inStock: true },
    ]
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: 'GlassWater',
    items: [
      { id: 'b1', name: 'Coca-Cola', description: 'Classic fizzy drink', price: 2.50, image: 'https://placehold.co/600x400.png', imageHint: 'cola drink', inStock: true },
      { id: 'b2', name: 'Orange Juice', description: 'Freshly squeezed', price: 3.00, image: 'https://placehold.co/600x400.png', imageHint: 'orange juice', inStock: true },
      { id: 'b3', name: 'Mineral Water', description: 'Still or sparkling', price: 2.00, image: 'https://placehold.co/600x400.png', imageHint: 'water bottle', inStock: true },
    ],
  },
  {
    id: 'desserts',
    name: 'Desserts',
    icon: 'IceCream2',
    items: [
      { id: 'd1', name: 'Tiramisu', description: 'Coffee-flavored Italian dessert', price: 7.00, image: 'https://placehold.co/600x400.png', imageHint: 'tiramisu cake', inStock: true },
      { id: 'd2', name: 'Cheesecake', description: 'Creamy New York style', price: 6.50, image: 'https://placehold.co/600x400.png', imageHint: 'cheesecake slice', inStock: false },
      { id: 'd3', name: 'Gelato', description: 'Choice of vanilla or chocolate', price: 4.50, image: 'https://placehold.co/600x400.png', imageHint: 'gelato scoop', inStock: true },
    ],
  },
];

const TABLES = [
    { id: 1, name: 'Table 1', location: 'Indoors', status: 'available', capacity: 4 },
    { id: 2, name: 'Table 2', location: 'Indoors', status: 'occupied', capacity: 2 },
    { id: 3, name: 'Table 3', location: 'Indoors', status: 'available', capacity: 2 },
    { id: 4, name: 'Table 4', location: 'Patio', status: 'reserved', capacity: 6 },
    { id: 5, name: 'Table 5', location: 'Patio', status: 'available', capacity: 4 },
    { id: 6, name: 'Table 6', location: 'Indoors', status: 'available', capacity: 4 },
    { id: 7, name: 'Table 7', location: 'Upstairs', status: 'occupied', capacity: 8 },
    { id: 8, name: 'Table 8', location: 'Upstairs', status: 'available', capacity: 2 },
    { id: 9, name: 'Table 9', location: 'Indoors', status: 'reserved', capacity: 4 },
    { id: 10, name: 'Table 10', location: 'Patio', status: 'available', capacity: 4 },
    { id: 11, name: 'Table 11', location: 'Indoors', status: 'occupied', capacity: 2 },
    { id: 12, name: 'Table 12', location: 'Upstairs', status: 'available', capacity: 6 },
];

async function migrateData() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    tls: true,
    tlsAllowInvalidCertificates: false,
  });
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB Atlas');
    
    const db = client.db('orderchha');
    
    // Create collections
    console.log('📦 Creating collections...');
    
    // 1. Menu Collection
    const menuCollection = db.collection('menu');
    await menuCollection.deleteMany({}); // Clear existing data
    await menuCollection.insertMany(MENU);
    console.log('✅ Menu data migrated');
    
    // 2. Tables Collection  
    const tablesCollection = db.collection('tables');
    await tablesCollection.deleteMany({});
    await tablesCollection.insertMany(TABLES);
    console.log('✅ Table data migrated');
    
    // 3. Users Collection (initialize with admin)
    const usersCollection = db.collection('users');
    await usersCollection.deleteMany({});
    await usersCollection.insertOne({
      uid: 'admin-001',
      name: 'Admin User',
      email: 'admin@orderchha.cafe',
      role: 'admin',
      createdAt: new Date(),
      isActive: true
    });
    console.log('✅ Admin user created');
    
    // 4. Orders Collection (empty initially)
    const ordersCollection = db.collection('orders');
    await ordersCollection.createIndex({ tableId: 1, status: 1, createdAt: -1 });
    console.log('✅ Orders collection ready');
    
    // 5. Inventory Collection (sample items)
    const inventoryCollection = db.collection('inventory');
    await inventoryCollection.deleteMany({});
    await inventoryCollection.insertMany([
      {
        id: 'flour',
        name: 'All-Purpose Flour',
        category: 'Pantry',
        currentStock: 50,
        minStock: 10,
        unit: 'kg',
        cost: 2.50,
        lastUpdated: new Date()
      },
      {
        id: 'cheese',
        name: 'Mozzarella Cheese',
        category: 'Dairy',
        currentStock: 25,
        minStock: 5,
        unit: 'kg',
        cost: 8.00,
        lastUpdated: new Date()
      },
      {
        id: 'tomatoes',
        name: 'Fresh Tomatoes',
        category: 'Produce',
        currentStock: 30,
        minStock: 10,
        unit: 'kg',
        cost: 3.00,
        lastUpdated: new Date()
      }
    ]);
    console.log('✅ Inventory items initialized');
    
    // 6. Transactions Collection
    const transactionsCollection = db.collection('transactions');
    await transactionsCollection.createIndex({ timestamp: -1, tableId: 1 });
    console.log('✅ Transactions collection ready');
    
    // 7. Settings Collection
    const settingsCollection = db.collection('settings');
    await settingsCollection.deleteMany({});
    await settingsCollection.insertOne({
      _id: 'app-settings',
      cafeName: 'Sips & Slices Corner',
      address: '123 Gourmet Street, Foodie City, 98765',
      currency: 'NPR',
      taxRate: 0.13,
      serviceCharge: 0.10,
      updatedAt: new Date()
    });
    console.log('✅ Settings initialized');
    
    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('📊 Collections created:');
    console.log('   - menu (menu categories and items)');
    console.log('   - tables (restaurant floor plan)');
    console.log('   - users (staff accounts)');
    console.log('   - orders (customer orders)');
    console.log('   - inventory (stock management)');
    console.log('   - transactions (payment records)');
    console.log('   - settings (app configuration)');
    console.log('');
    console.log('🔄 Next: Update your app to use MongoDB instead of static data');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

migrateData();
