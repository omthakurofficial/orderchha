
import type { MenuCategory, Table, User } from '@/types';
import { Flame, GlassWater, IceCream2, Salad, Pizza } from 'lucide-react';

export const MENU: MenuCategory[] = [
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


export const TABLES: Table[] = [
    { id: 1, status: 'available', capacity: 4 },
    { id: 2, status: 'occupied', capacity: 2 },
    { id: 3, status: 'available', capacity: 2 },
    { id: 4, status: 'reserved', capacity: 6 },
    { id: 5, status: 'available', capacity: 4 },
    { id: 6, status: 'available', capacity: 4 },
    { id: 7, status: 'occupied', capacity: 8 },
    { id: 8, status: 'available', capacity: 2 },
    { id: 9, status: 'reserved', capacity: 4 },
    { id: 10, status: 'available', capacity: 4 },
    { id: 11, status: 'occupied', capacity: 2 },
    { id: 12, status: 'available', capacity: 6 },
];

export const USERS: User[] = [
  { uid: 'admin-001', name: 'Admin User', email: 'admin@orderchha.com', role: 'admin' },
  { uid: 'staff-001', name: 'Staff User', email: 'staff@orderchha.com', role: 'staff' },
];
