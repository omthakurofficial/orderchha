// STEP 1: Replace fake data with customizable real data
// This is a transition step before moving to MongoDB

import type { MenuCategory, Table, User } from '@/types';

// 🍕 REAL MENU DATA - Customize this for your restaurant
export const MENU: MenuCategory[] = [
  {
    id: 'pizza',
    name: '🍕 Pizzas',
    icon: 'Flame',
    items: [
      { 
        id: 'p1', 
        name: 'Margherita Classic', 
        description: 'Fresh mozzarella, tomato sauce, basil', 
        price: 450.00, // NPR pricing
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', 
        imageHint: 'margherita pizza', 
        inStock: true 
      },
      { 
        id: 'p2', 
        name: 'Pepperoni Supreme', 
        description: 'Spicy pepperoni with extra cheese', 
        price: 550.00, 
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', 
        imageHint: 'pepperoni pizza', 
        inStock: true 
      },
      { 
        id: 'p3', 
        name: 'Veggie Garden', 
        description: 'Bell peppers, mushrooms, onions, olives', 
        price: 500.00, 
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', 
        imageHint: 'vegetable pizza', 
        inStock: true 
      },
      { 
        id: 'p4', 
        name: 'Chicken BBQ', 
        description: 'Grilled chicken with BBQ sauce', 
        price: 600.00, 
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', 
        imageHint: 'bbq chicken pizza', 
        inStock: true 
      },
    ],
  },
  {
    id: 'beverages',
    name: '🥤 Beverages',
    icon: 'GlassWater',
    items: [
      { 
        id: 'b1', 
        name: 'Coca-Cola', 
        description: 'Classic cola drink', 
        price: 80.00, 
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop', 
        imageHint: 'cola bottle', 
        inStock: true 
      },
      { 
        id: 'b2', 
        name: 'Fresh Orange Juice', 
        description: 'Freshly squeezed orange juice', 
        price: 120.00, 
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop', 
        imageHint: 'orange juice glass', 
        inStock: true 
      },
      { 
        id: 'b3', 
        name: 'Mineral Water', 
        description: 'Pure mineral water', 
        price: 50.00, 
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop', 
        imageHint: 'water bottle', 
        inStock: true 
      },
      { 
        id: 'b4', 
        name: 'Lassi (Sweet)', 
        description: 'Traditional Nepali yogurt drink', 
        price: 100.00, 
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop', 
        imageHint: 'lassi glass', 
        inStock: true 
      },
    ],
  },
  {
    id: 'snacks',
    name: '🍟 Snacks',
    icon: 'Pizza',
    items: [
      { 
        id: 'sn1', 
        name: 'French Fries', 
        description: 'Crispy golden potato fries', 
        price: 150.00, 
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', 
        imageHint: 'french fries', 
        inStock: true 
      },
      { 
        id: 'sn2', 
        name: 'Chicken Wings', 
        description: 'Spicy buffalo wings (6 pieces)', 
        price: 350.00, 
        image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop', 
        imageHint: 'chicken wings', 
        inStock: true 
      },
      { 
        id: 'sn3', 
        name: 'Momo (Steam)', 
        description: 'Traditional Nepali dumplings (10 pieces)', 
        price: 200.00, 
        image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop', 
        imageHint: 'steamed momo', 
        inStock: true 
      },
    ]
  },
  {
    id: 'desserts',
    name: '🍰 Desserts',
    icon: 'IceCream2',
    items: [
      { 
        id: 'd1', 
        name: 'Chocolate Brownie', 
        description: 'Rich chocolate brownie with vanilla ice cream', 
        price: 180.00, 
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', 
        imageHint: 'chocolate brownie', 
        inStock: true 
      },
      { 
        id: 'd2', 
        name: 'Kulfi Ice Cream', 
        description: 'Traditional Indian ice cream', 
        price: 120.00, 
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', 
        imageHint: 'kulfi ice cream', 
        inStock: true 
      },
    ],
  },
];

// 🪑 REAL TABLE LAYOUT - Customize for your restaurant floor plan
export const TABLES: Table[] = [
    { id: 1, name: 'Table 1', location: 'Ground Floor', status: 'available', capacity: 4 },
    { id: 2, name: 'Table 2', location: 'Ground Floor', status: 'available', capacity: 2 },
    { id: 3, name: 'Table 3', location: 'Ground Floor', status: 'available', capacity: 6 },
    { id: 4, name: 'Table 4', location: 'First Floor', status: 'available', capacity: 4 },
    { id: 5, name: 'Table 5', location: 'First Floor', status: 'available', capacity: 2 },
    { id: 6, name: 'Table 6', location: 'Outdoor', status: 'available', capacity: 4 },
    { id: 7, name: 'Table 7', location: 'Outdoor', status: 'available', capacity: 6 },
    { id: 8, name: 'Table 8', location: 'Ground Floor', status: 'available', capacity: 8 },
];

// 👥 REAL USER DATA - Your staff accounts
export const USERS: User[] = [
  { 
    uid: 'admin-001', 
    name: 'Restaurant Manager', 
    email: 'admin@orderchha.cafe', 
    role: 'admin' 
  },
  { 
    uid: 'staff-001', 
    name: 'Kitchen Staff', 
    email: 'kitchen@orderchha.cafe', 
    role: 'staff' 
  },
  { 
    uid: 'waiter-001', 
    name: 'Wait Staff', 
    email: 'waiter@orderchha.cafe', 
    role: 'staff' 
  },
];

// 📊 MONGODB INTEGRATION STATUS
export const MONGODB_STATUS = {
  enabled: true,
  collections: ['orders', 'transactions', 'analytics'],
  note: 'Menu and tables use static data, orders use MongoDB for persistence'
};
