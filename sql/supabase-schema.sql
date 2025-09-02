-- Supabase SQL Schema for OrderChha Restaurant Management System
-- Run this in Supabase SQL Editor

-- Create Tables

-- 1. Menu Categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  image_hint VARCHAR(100),
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Restaurant Tables
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INTEGER REFERENCES tables(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name VARCHAR(100),
  phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Settings
CREATE TABLE settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'app-settings',
  cafe_name VARCHAR(200) DEFAULT 'OrderChha Restaurant',
  address TEXT,
  phone VARCHAR(20),
  logo TEXT,
  currency VARCHAR(10) DEFAULT 'NPR',
  tax_rate DECIMAL(4,2) DEFAULT 0.13,
  service_charge DECIMAL(4,2) DEFAULT 0.10,
  receipt_note TEXT,
  ai_suggestions_enabled BOOLEAN DEFAULT true,
  online_ordering_enabled BOOLEAN DEFAULT true,
  payment_qr_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Inventory
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'pcs',
  min_quantity INTEGER DEFAULT 10,
  max_quantity INTEGER DEFAULT 100,
  supplier VARCHAR(200),
  cost_price DECIMAL(10,2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Comprehensive Users Table (International Support)
CREATE TABLE users (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appwrite_id VARCHAR(100) UNIQUE,
  uid VARCHAR(100) UNIQUE NOT NULL,
  
  -- Basic Information
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE,
  role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'cashier', 'accountant', 'waiter', 'kitchen')),
  photo_url TEXT,
  active BOOLEAN DEFAULT true,
  
  -- Contact Information
  mobile VARCHAR(20),
  emergency_contact VARCHAR(20),
  address TEXT,
  
  -- Personal Details
  date_of_birth DATE,
  blood_group VARCHAR(10),
  marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  religion VARCHAR(50),
  
  -- Location & Nationality (International Support)
  country VARCHAR(50) DEFAULT 'Nepal',
  nationality VARCHAR(50),
  languages_spoken TEXT,
  
  -- Work Information
  designation VARCHAR(100),
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  salary DECIMAL(10,2),
  joining_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Education Details
  highest_education VARCHAR(20) CHECK (highest_education IN ('primary', 'secondary', 'higher_secondary', 'bachelor', 'master', 'doctorate', 'diploma', 'certificate')),
  institute_name VARCHAR(200),
  graduation_year VARCHAR(4),
  specialization VARCHAR(100),
  additional_certifications TEXT,
  
  -- Experience & Skills
  previous_experience TEXT,
  skills TEXT,
  
  -- Banking Information
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  routing_number VARCHAR(50),
  account_type VARCHAR(20) CHECK (account_type IN ('savings', 'checking', 'current')),
  bank_branch VARCHAR(100),
  
  -- Document Information
  national_id VARCHAR(50),
  tax_id VARCHAR(50),
  passport_number VARCHAR(50),
  driving_license VARCHAR(50),
  
  -- Additional Information
  notes TEXT,
  credit_balance DECIMAL(10,2) DEFAULT 0,
  is_customer BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_tables_status ON tables(status);

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_appwrite_id ON users(appwrite_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Real-time for all tables (Supabase will handle this automatically)
-- Real-time is enabled by default for all tables in Supabase

-- Insert Sample Data
INSERT INTO menu_categories (id, name, icon) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '🍕 Pizzas', 'Flame'),
  ('550e8400-e29b-41d4-a716-446655440002', '🥤 Beverages', 'GlassWater'),
  ('550e8400-e29b-41d4-a716-446655440003', '🍟 Snacks & Appetizers', 'Pizza'),
  ('550e8400-e29b-41d4-a716-446655440004', '🍰 Desserts', 'IceCream2');

-- Sample comprehensive users (Nepal-focused)
INSERT INTO users (
    uid, name, email, role, country, nationality, mobile, designation, 
    employee_id, department, languages_spoken, highest_education, 
    institute_name, skills, active
) VALUES 
(
    'admin-nepal-001',
    'Prakash Thakur',
    'admin@orderchha.cafe',
    'admin',
    'Nepal',
    'Nepali',
    '+977 9876543210',
    'Restaurant Owner & Manager',
    'ADM001',
    'Management',
    'Nepali, Hindi, English',
    'bachelor',
    'Tribhuvan University',
    'Restaurant management, Team leadership, Financial planning',
    true
),
(
    'staff-nepal-001',
    'Ramesh Sharma',
    'ramesh@orderchha.cafe',
    'waiter',
    'Nepal',
    'Nepali',
    '+977 9812345678',
    'Senior Waiter',
    'STF001',
    'Service',
    'Nepali, Hindi, English',
    'higher_secondary',
    'Kathmandu Model College',
    'Customer service, Order management, Multi-lingual communication',
    true
),
(
    'kitchen-nepal-001',
    'Sita Gurung',
    'sita@orderchha.cafe',
    'kitchen',
    'Nepal',
    'Nepali',
    '+977 9823456789',
    'Head Chef',
    'KIT001',
    'Kitchen',
    'Nepali, English',
    'diploma',
    'Hotel Management Institute',
    'Cooking, Menu planning, Kitchen management, Food safety',
    true
),
(
    'cashier-nepal-001',
    'Bikash Tamang',
    'bikash@orderchha.cafe',
    'cashier',
    'Nepal',
    'Nepali',
    '+977 9834567890',
    'Head Cashier',
    'CSH001',
    'Billing',
    'Nepali, Hindi, English',
    'bachelor',
    'Nepal Commerce Campus',
    'Cash handling, Billing systems, Customer service, Accounting',
    true
);

INSERT INTO menu_items (id, category_id, name, description, price, image, image_hint, in_stock) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Margherita Classic', 'Fresh mozzarella, tomato sauce, basil', 450.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', 'margherita pizza', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Pepperoni Supreme', 'Spicy pepperoni with extra cheese', 550.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', 'pepperoni pizza', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Veggie Garden', 'Bell peppers, mushrooms, onions, olives', 500.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', 'vegetable pizza', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Chicken BBQ', 'Grilled chicken with BBQ sauce', 600.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', 'bbq chicken pizza', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Coca-Cola', 'Classic cola drink', 80.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop', 'cola bottle', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 120.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop', 'orange juice glass', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Mineral Water', 'Pure mineral water', 50.00, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop', 'water bottle', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Sweet Lassi', 'Traditional Nepali yogurt drink', 100.00, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop', 'lassi glass', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'French Fries', 'Crispy golden potato fries', 150.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', 'french fries', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Chicken Wings', 'Spicy buffalo wings (6 pieces)', 350.00, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop', 'chicken wings', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Steam Momo', 'Traditional Nepali dumplings (10 pieces)', 200.00, 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop', 'steamed momo', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Fried Momo', 'Crispy fried dumplings (10 pieces)', 220.00, 'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=400&h=300&fit=crop', 'fried momo', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Chocolate Brownie', 'Rich chocolate brownie with vanilla ice cream', 180.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', 'chocolate brownie', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Kulfi Ice Cream', 'Traditional Indian ice cream', 120.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', 'kulfi ice cream', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Gulab Jamun', 'Sweet milk-based balls in syrup (4 pieces)', 150.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop', 'gulab jamun', true);

INSERT INTO tables (id, name, location, status, capacity) VALUES
  (1, 'Table 1', 'Ground Floor', 'available', 4),
  (2, 'Table 2', 'Ground Floor', 'available', 2),
  (3, 'Table 3', 'Ground Floor', 'available', 6),
  (4, 'Table 4', 'Ground Floor', 'available', 4),
  (5, 'Table 5', 'First Floor', 'available', 2),
  (6, 'Table 6', 'First Floor', 'available', 4),
  (7, 'Table 7', 'First Floor', 'available', 8),
  (8, 'Table 8', 'Outdoor', 'available', 6),
  (9, 'Table 9', 'Outdoor', 'available', 4),
  (10, 'Table 10', 'Ground Floor', 'available', 2);

INSERT INTO settings (id, cafe_name, address, phone, currency, tax_rate, service_charge, receipt_note, ai_suggestions_enabled, online_ordering_enabled) VALUES
  ('app-settings', 'OrderChha Restaurant', 'Thamel, Kathmandu, Nepal', '+977-01-4444444', 'NPR', 0.13, 0.10, 'धन्यवाद! Thank you for dining with OrderChha!', true, true);

INSERT INTO inventory (name, quantity, unit, min_quantity, max_quantity, supplier, cost_price) VALUES
  ('Pizza Dough', 50, 'kg', 10, 100, 'Local Supplier', 80.00),
  ('Mozzarella Cheese', 25, 'kg', 5, 50, 'Dairy Co.', 450.00),
  ('Chicken', 30, 'kg', 10, 60, 'Meat Supplier', 320.00),
  ('Vegetables Mix', 40, 'kg', 15, 80, 'Fresh Farms', 120.00),
  ('Coca-Cola', 100, 'bottles', 20, 200, 'Beverage Co.', 35.00);
