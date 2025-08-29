-- STEP 4: Create Inventory and Users Tables + Insert Sample Data
-- Run this after Step 3 is successful

-- Inventory
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

-- Users (for staff management)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appwrite_id VARCHAR(100) UNIQUE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'cashier')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample tables
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

-- Insert settings
INSERT INTO settings (id, cafe_name, address, phone, currency, tax_rate, service_charge, receipt_note, ai_suggestions_enabled, online_ordering_enabled) VALUES
  ('app-settings', 'OrderChha Restaurant', 'Kathmandu, Nepal', '+977-9800000000', 'NPR', 0.13, 0.10, 'Thank you for dining with us!', true, true);

-- Insert sample inventory
INSERT INTO inventory (name, quantity, unit, min_quantity, max_quantity, supplier, cost_price) VALUES
  ('Pizza Dough', 50, 'kg', 10, 100, 'Local Supplier', 80.00),
  ('Mozzarella Cheese', 25, 'kg', 5, 50, 'Dairy Co.', 450.00),
  ('Chicken', 30, 'kg', 10, 60, 'Meat Supplier', 320.00),
  ('Vegetables Mix', 40, 'kg', 15, 80, 'Fresh Farms', 120.00),
  ('Coca-Cola', 100, 'bottles', 20, 200, 'Beverage Co.', 35.00);
