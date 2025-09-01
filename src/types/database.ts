// Database bridge types
// This file extends the main types to provide compatibility between Firebase and Supabase

import type { ComponentType } from "react";
import type { 
  MenuItem as AppMenuItem,
  MenuCategory as AppMenuCategory,
  Table as AppTable,
  Settings as AppSettings,
  KitchenOrder as AppKitchenOrder,
  InventoryItem as AppInventoryItem,
  Transaction as AppTransaction,
  User as AppUser,
  OrderItem as AppOrderItem
} from './index';

// Re-export base types with compatibility extensions
export interface MenuItem extends AppMenuItem {
  category?: string;
  available?: boolean;
  [key: string]: any;
}

export interface MenuCategory extends AppMenuCategory {
  description?: string;
  menu_items?: MenuItem[];
  [key: string]: any;
}

export interface TableData extends Omit<AppTable, 'status' | 'location'> {
  status?: 'available' | 'occupied' | 'reserved';
  [key: string]: any;
}

export interface Order {
  id?: string;
  tableId: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt: string;
  [key: string]: any;
}

export interface OrderItem extends AppOrderItem {
  [key: string]: any;
}

export interface Settings extends Omit<AppSettings, 'paymentQrUrl'> {
  qrPaymentUrl: string;
  [key: string]: any;
}

export interface InventoryItem extends AppInventoryItem {
  threshold?: number;
  [key: string]: any;
}

export interface Transaction extends Omit<AppTransaction, 'timestamp'> {
  createdAt: string;
  status: string;
  orderId: string;
  [key: string]: any;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  photoURL?: string;
  [key: string]: any;
}

// Subscription types
export interface TableChangeCallback {
  (change: { type: string; doc: TableData }): void;
}

export interface OrderChangeCallback {
  (change: { type: string; doc: Order }): void;
}

export interface Subscription {
  unsubscribe: () => void;
}

// Database adapter result type
export interface DbResult<T> {
  data: T | null;
  error: Error | null;
}
