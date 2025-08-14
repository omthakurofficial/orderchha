
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
    status: 'pending' | 'in-kitchen' | 'completed';
    timestamp: string;
    total: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

export interface Table {
  id: number;
  status: 'available' | 'occupied' | 'reserved' | 'disabled' | 'billing';
  capacity: number;
}

export interface Settings {
    cafeName: string;
    address: string;
    phone: string;
    logo: string;
    aiSuggestionsEnabled: boolean;
    onlineOrderingEnabled: boolean;
    paymentQrUrl: string;
}

export interface Transaction {
    id: string;
    tableId: number;
    amount: number;
    method: 'cash' | 'online';
    timestamp: string;
}

export type UserRole = 'admin' | 'staff';

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
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string; // Password is used for creation, but not stored in Firestore doc
    role: UserRole;
    mobile?: string;
    address?: string;
    designation?: string;
    joiningDate?: string;
}
