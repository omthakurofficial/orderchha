

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
    orderId?: string;
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
  email?: string; // Make email optional instead of nullable
  name: string;
  role: UserRole;
  photoUrl?: string;
  mobile?: string;
  address?: string;
  designation?: string;
  joiningDate?: string;
  creditBalance?: number;
  isCustomer?: boolean;
  
  // Extended fields for comprehensive user management
  emergencyContact?: string;
  employeeId?: string;
  department?: string;
  salary?: number;
  dateOfBirth?: string;
  bloodGroup?: string;
  country?: string;
  nationality?: string;
  nationalId?: string;
  taxId?: string;
  passportNumber?: string;
  drivingLicense?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: 'savings' | 'checking' | 'current';
  bankBranch?: string;
  highestEducation?: 'primary' | 'secondary' | 'higher_secondary' | 'bachelor' | 'master' | 'doctorate' | 'diploma' | 'certificate';
  instituteName?: string;
  graduationYear?: string;
  specialization?: string;
  additionalCertifications?: string;
  previousExperience?: string;
  skills?: string;
  languagesSpoken?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  religion?: string;
  notes?: string;
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
    emergencyContact?: string;
    employeeId?: string;
    department?: string;
    salary?: number;
    dateOfBirth?: string;
    bloodGroup?: string;
    
    // International & Location
    country?: string;
    nationality?: string;
    
    // Document Information (flexible for different countries)
    nationalId?: string; // Aadhar for India, Citizenship for Nepal, etc.
    taxId?: string; // PAN for India, VAT for Nepal, etc.
    passportNumber?: string;
    drivingLicense?: string;
    
    // Bank Information
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string; // IFSC for India, Bank Code for Nepal
    accountType?: 'savings' | 'checking' | 'current';
    bankBranch?: string;
    
    // Education Details
    highestEducation?: 'primary' | 'secondary' | 'higher_secondary' | 'bachelor' | 'master' | 'doctorate' | 'diploma' | 'certificate';
    instituteName?: string;
    graduationYear?: string;
    specialization?: string;
    additionalCertifications?: string;
    
    // Experience & Skills
    previousExperience?: string;
    skills?: string;
    languagesSpoken?: string;
    
    // Additional Information
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    religion?: string;
    notes?: string;
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
