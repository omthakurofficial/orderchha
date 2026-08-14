import type { MenuCategory, Table, User } from '@/types';

// �️ Nepal Restaurant Mock Data - ready for ordering flow testing
export const MENU: MenuCategory[] = [
  {
    id: 'nepali-mains',
    name: '🍛 Nepali Mains',
    icon: 'UtensilsCrossed',
    items: [
      {
        id: 'nm1',
        name: 'Chicken Choila',
        description: 'Smoky grilled chicken with mustard oil, chili, and herbs.',
        price: 420.00,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
        imageHint: 'Nepali grilled chicken',
        inStock: true
      },
      {
        id: 'nm2',
        name: 'Thakali Set',
        description: 'Dal, bhat, tarkari, achar, and seasonal greens.',
        price: 560.00,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
        imageHint: 'Nepali thali platter',
        inStock: true
      },
      {
        id: 'nm3',
        name: 'Buff Sekuwa',
        description: 'Chargrilled buffalo meat with spicy Nepali masala.',
        price: 480.00,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
        imageHint: 'Nepali sekuwa grilled meat',
        inStock: true
      },
      {
        id: 'nm4',
        name: 'Dal Bhat Tarkari',
        description: 'Classic lentil rice with seasonal vegetables and ghee.',
        price: 390.00,
        image: 'https://images.unsplash.com/photo-1604908553252-8d8d5d3f6f2d?w=800&h=600&fit=crop',
        imageHint: 'Nepali dal bhat',
        inStock: true
      },
      {
        id: 'nm5',
        name: 'Gundruk Ko Jhol',
        description: 'Traditional fermented greens soup with Himalayan aroma.',
        price: 320.00,
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop',
        imageHint: 'Nepali soup',
        inStock: true
      }
    ]
  },
  {
    id: 'momos',
    name: '🥟 Momos & Snacks',
    icon: 'Soup',
    items: [
      {
        id: 'ms1',
        name: 'Steam Momo',
        description: 'Juicy dumplings served with traditional tomato achar.',
        price: 220.00,
        image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&h=600&fit=crop',
        imageHint: 'steam momo',
        inStock: true
      },
      {
        id: 'ms2',
        name: 'Crispy Fried Momo',
        description: 'Golden fried dumplings with chili garlic dip.',
        price: 250.00,
        image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop',
        imageHint: 'fried dumplings',
        inStock: true
      },
      {
        id: 'ms3',
        name: 'Chatamari',
        description: 'Nepali rice pancake topped with minced chicken and herbs.',
        price: 260.00,
        image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&h=600&fit=crop',
        imageHint: 'Nepali chatamari',
        inStock: true
      },
      {
        id: 'ms4',
        name: 'French Fries',
        description: 'Crispy potato fries with peri-peri seasoning.',
        price: 180.00,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop',
        imageHint: 'fries',
        inStock: true
      }
    ]
  },
  {
    id: 'thai-fusion',
    name: '🌶️ Thai Fusion',
    icon: 'Beef',
    items: [
      {
        id: 'tf1',
        name: 'Tom Yum Soup',
        description: 'Hot and sour soup with shrimp, herbs, and lemongrass.',
        price: 340.00,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
        imageHint: 'Thai tom yum soup',
        inStock: true
      },
      {
        id: 'tf2',
        name: 'Green Curry Chicken',
        description: 'Coconut curry with basil, vegetables, and chicken.',
        price: 520.00,
        image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop',
        imageHint: 'green curry chicken',
        inStock: true
      },
      {
        id: 'tf3',
        name: 'Pad Thai',
        description: 'Rice noodles tossed with tamarind, peanuts, and egg.',
        price: 490.00,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop',
        imageHint: 'pad thai noodles',
        inStock: true
      },
      {
        id: 'tf4',
        name: 'Thai Basil Fried Rice',
        description: 'Fragrant jasmine rice with basil, vegetables, and egg.',
        price: 460.00,
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop',
        imageHint: 'fried rice thai style',
        inStock: true
      }
    ]
  },
  {
    id: 'beverages',
    name: '🥤 Beverages',
    icon: 'GlassWater',
    items: [
      {
        id: 'bv1',
        name: 'Masala Chai',
        description: 'Strong Nepali masala tea with ginger and cardamom.',
        price: 90.00,
        image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&h=600&fit=crop',
        imageHint: 'masala chai',
        inStock: true
      },
      {
        id: 'bv2',
        name: 'Sweet Lassi',
        description: 'Traditional yogurt-based drink served chilled.',
        price: 120.00,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
        imageHint: 'sweet lassi',
        inStock: true
      },
      {
        id: 'bv3',
        name: 'Fresh Lime Soda',
        description: 'Sparkling lime soda with a citrus kick.',
        price: 110.00,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f2b0d1d2?w=800&h=600&fit=crop',
        imageHint: 'lime soda',
        inStock: true
      },
      {
        id: 'bv4',
        name: 'Mango Smoothie',
        description: 'Fresh mango blended with yogurt and ice.',
        price: 180.00,
        image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800&h=600&fit=crop',
        imageHint: 'mango smoothie',
        inStock: true
      }
    ]
  },
  {
    id: 'desserts',
    name: '🍰 Desserts',
    icon: 'IceCream2',
    items: [
      {
        id: 'ds1',
        name: 'Kheer',
        description: 'Traditional rice pudding infused with cardamom.',
        price: 170.00,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=600&fit=crop',
        imageHint: 'Nepali kheer dessert',
        inStock: true
      },
      {
        id: 'ds2',
        name: 'Gulab Jamun',
        description: 'Soft milk dumplings soaked in rose-infused syrup.',
        price: 160.00,
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop',
        imageHint: 'gulab jamun dessert',
        inStock: true
      },
      {
        id: 'ds3',
        name: 'Chocolate Brownie',
        description: 'Warm fudgy brownie with vanilla cream.',
        price: 190.00,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop',
        imageHint: 'brownie dessert',
        inStock: true
      }
    ]
  }
];

// 🪑 REAL TABLE LAYOUT - Updated for typical restaurant
export const TABLES: Table[] = [
    { id: 1, name: 'Table 1', location: 'Ground Floor', status: 'available', capacity: 4 },
    { id: 2, name: 'Table 2', location: 'Ground Floor', status: 'available', capacity: 2 },
    { id: 3, name: 'Table 3', location: 'Ground Floor', status: 'available', capacity: 6 },
    { id: 4, name: 'Table 4', location: 'Ground Floor', status: 'available', capacity: 4 },
    { id: 5, name: 'Table 5', location: 'First Floor', status: 'available', capacity: 2 },
    { id: 6, name: 'Table 6', location: 'First Floor', status: 'available', capacity: 4 },
    { id: 7, name: 'Table 7', location: 'First Floor', status: 'available', capacity: 8 },
    { id: 8, name: 'Table 8', location: 'Outdoor', status: 'available', capacity: 6 },
    { id: 9, name: 'Table 9', location: 'Outdoor', status: 'available', capacity: 4 },
    { id: 10, name: 'Table 10', location: 'Ground Floor', status: 'available', capacity: 2 },
];

// 👥 REAL STAFF DATA
export const USERS: User[] = [
  { 
    uid: 'admin-001', 
    name: 'Restaurant Manager', 
    email: 'admin@orderchha.com',
    role: 'admin' 
  },
  { 
    uid: 'kitchen-001', 
    name: 'Head Chef', 
    email: 'chef@orderchha.cafe', 
    role: 'staff' 
  },
  { 
    uid: 'waiter-001', 
    name: 'Senior Waiter', 
    email: 'waiter@orderchha.cafe', 
    role: 'staff' 
  },
];
