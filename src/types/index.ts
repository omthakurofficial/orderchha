

import type { ComponentType } from "react";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageHint: string;
  inStock: boolean;
}

export interface OrderItem extends MenuItem {
    quantity: number;
}

export interface KitchenOrder {
    id: string;
    tableId: number;
    items: OrderItem[];
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    timestamp: string;
    totalAmount: number;
    total: number;  // Adding total property for compatibility
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

export interface Table {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'billing' | 'disabled';
  capacity: number;
  location: string;
}

export interface Settings {
    cafeName: string;
    address: string;
    phone: string;
    logo: string;
    currency: string;
    taxRate: number;
    serviceCharge: number;
    receiptNote: string;
    aiSuggestionsEnabled: boolean;
    onlineOrderingEnabled: boolean;
    paymentQrUrl: string;
}

export interface Transaction {
    id: string;
    tableId: number;
    amount: number;
    method: 'cash' | 'online' | 'credit' | 'card' | 'qr';
    timestamp: string;
    customerId?: string;
    customerName?: string;
    notes?: string;
}

export type UserRole = 'admin' | 'staff' | 'cashier' | 'accountant' | 'waiter' | 'kitchen';

export interface User {
  uid: string;
  email: string | null;
  name: string;
  role: UserRole;
  photoUrl?: string;
  mobile?: string;
  address?: string;
  designation?: string;
  joiningDate?: string;
  creditBalance?: number;
  isCustomer?: boolean;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string; // Password is used for creation, but not stored in database
    role: UserRole;
    mobile?: string;
    address?: string;
    designation?: string;
    joiningDate?: string;
    creditBalance?: number;
    isCustomer?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: 'kg' | 'g' | 'ltr' | 'ml' | 'pcs' | 'pack';
  purchasePrice: number;
  lowStockThreshold: number;
  supplierId?: string;
  lastUpdated: string;
}
