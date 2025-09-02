-- COMPLETE DATABASE SETUP FOR ORDERCHHA
-- Run these queries manually in your Supabase SQL editor

-- ===============================
-- 1. DISABLE RLS (Row Level Security) for testing
-- ===============================
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ===============================
-- 2. CREATE TRANSACTIONS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INTEGER REFERENCES tables(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(20) DEFAULT 'cash' CHECK (method IN ('cash', 'online', 'card')),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  customer_name VARCHAR(100),
  phone VARCHAR(20),
  invoice_number VARCHAR(50) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for transactions table
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- ===============================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ===============================
CREATE INDEX IF NOT EXISTS idx_transactions_table_id ON transactions(table_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_method ON transactions(method);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- ===============================
-- 4. ADD MISSING COLUMNS TO EXISTING TABLES
-- ===============================
-- Add missing columns to tables if they don't exist
DO $$ 
BEGIN
    -- Add status column to tables if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tables' AND column_name='status') THEN
        ALTER TABLE tables ADD COLUMN status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'billing', 'cleaning'));
    END IF;
    
    -- Add notes column to orders if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Add customer_name column to orders if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name VARCHAR(100);
    END IF;
    
    -- Add phone column to orders if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='phone') THEN
        ALTER TABLE orders ADD COLUMN phone VARCHAR(20);
    END IF;
END $$;

-- ===============================
-- 5. SAMPLE DATA - TABLES
-- ===============================
INSERT INTO tables (id, name, location, capacity, status) VALUES
  (1, 'Table 1', 'Main Hall', 4, 'available'),
  (2, 'Table 2', 'Main Hall', 6, 'available'),
  (3, 'Table 3', 'Garden', 4, 'available'),
  (4, 'Table 4', 'Private Room', 8, 'available'),
  (5, 'Table 5', 'Terrace', 2, 'available'),
  (6, 'Table 6', 'Main Hall', 4, 'available'),
  (7, 'Table 7', 'Garden', 6, 'available'),
  (8, 'Table 8', 'Private Room', 10, 'available')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  capacity = EXCLUDED.capacity,
  status = COALESCE(tables.status, EXCLUDED.status);

-- ===============================
-- 6. SAMPLE DATA - MENU CATEGORIES
-- ===============================
INSERT INTO menu_categories (id, name, description, display_order) VALUES
  ('starters', 'Starters', 'Appetizers and small plates', 1),
  ('mains', 'Main Courses', 'Primary dishes and entrees', 2),
  ('desserts', 'Desserts', 'Sweet treats and desserts', 3),
  ('beverages', 'Beverages', 'Drinks and beverages', 4),
  ('specials', 'Today''s Specials', 'Chef''s special recommendations', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- ===============================
-- 7. SAMPLE DATA - MENU ITEMS
-- ===============================
INSERT INTO menu_items (id, name, description, price, category, image_url, available, preparation_time) VALUES
  ('pizza-margherita', 'Margherita Pizza', 'Fresh tomatoes, mozzarella, basil', 299.00, 'mains', '/images/pizza-margherita.jpg', true, 15),
  ('pasta-carbonara', 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 249.00, 'mains', '/images/pasta-carbonara.jpg', true, 12),
  ('chicken-tikka', 'Chicken Tikka', 'Grilled chicken with Indian spices', 329.00, 'mains', '/images/chicken-tikka.jpg', true, 20),
  ('veg-biryani', 'Vegetable Biryani', 'Fragrant rice with mixed vegetables', 199.00, 'mains', '/images/veg-biryani.jpg', true, 25),
  ('samosa', 'Samosa (2 pcs)', 'Crispy fried pastry with potato filling', 89.00, 'starters', '/images/samosa.jpg', true, 8),
  ('paneer-tikka', 'Paneer Tikka', 'Grilled cottage cheese with spices', 179.00, 'starters', '/images/paneer-tikka.jpg', true, 15),
  ('masala-chai', 'Masala Chai', 'Spiced Indian tea', 49.00, 'beverages', '/images/masala-chai.jpg', true, 5),
  ('fresh-lime-soda', 'Fresh Lime Soda', 'Refreshing lime drink', 59.00, 'beverages', '/images/lime-soda.jpg', true, 3),
  ('gulab-jamun', 'Gulab Jamun (2 pcs)', 'Sweet milk dumplings in syrup', 99.00, 'desserts', '/images/gulab-jamun.jpg', true, 5),
  ('ice-cream', 'Vanilla Ice Cream', 'Premium vanilla ice cream', 89.00, 'desserts', '/images/ice-cream.jpg', true, 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  available = EXCLUDED.available,
  preparation_time = EXCLUDED.preparation_time;

-- ===============================
-- 8. SAMPLE DATA - INVENTORY
-- ===============================
INSERT INTO inventory (id, name, quantity, unit, min_quantity, max_quantity, supplier) VALUES
  ('3c315cf-4a9c-4f44-ad0c-8cc193a04767', 'Pizza Dough', 50, 'kg', 10, 100, 'Local Supplier'),
  ('4c565a3b-38ac-41ba-b409-df66af0ec10', 'Vegetables Mix', 40, 'kg', 15, 80, 'Fresh Farms'),
  ('78dba407-607a-4e80-b2a9-87e02a336c1', 'Mozzarella Cheese', 25, 'kg', 5, 50, 'Dairy Co.'),
  ('8f5fcc8-680a-4de-97f3-3d76cf6df7ca', 'Coca-Cola', 100, 'bottles', 20, 200, 'Beverage Co.'),
  ('b732b448-ac9f-473e-9a00-9cbd908adf', 'Chicken', 30, 'kg', 10, 60, 'Meat Supplier')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  min_quantity = EXCLUDED.min_quantity,
  max_quantity = EXCLUDED.max_quantity,
  supplier = EXCLUDED.supplier;

-- ===============================
-- 9. CREATE UPDATED_AT TRIGGER FUNCTION
-- ===============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ===============================
-- 10. ADD TRIGGERS FOR UPDATED_AT
-- ===============================
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================
-- 11. GRANT ALL PERMISSIONS (UNRESTRICTED)
-- ===============================
-- Grant all permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant all permissions to anon users (for development)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Grant all permissions to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ===============================
-- 12. ENABLE REALTIME FOR NOTIFICATIONS
-- ===============================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;

-- ===============================
-- 13. CREATE SAMPLE ORDERS FOR TESTING
-- ===============================
-- Insert sample orders
DO $$
DECLARE
    order_uuid1 UUID := gen_random_uuid();
    order_uuid2 UUID := gen_random_uuid();
BEGIN
    -- Sample Order 1
    INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) VALUES
    (order_uuid1, 1, 598.00, 'pending', 'John Doe', '+91-9876543210', '2 items ordered')
    ON CONFLICT (id) DO NOTHING;
    
    -- Sample Order Items for Order 1
    INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
    (order_uuid1, 'pizza-margherita', 1, 299.00),
    (order_uuid1, 'pizza-margherita', 1, 299.00)
    ON CONFLICT DO NOTHING;
    
    -- Sample Order 2
    INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) VALUES
    (order_uuid2, 2, 427.00, 'preparing', 'Jane Smith', '+91-9876543211', '3 items ordered')
    ON CONFLICT (id) DO NOTHING;
    
    -- Sample Order Items for Order 2
    INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
    (order_uuid2, 'pasta-carbonara', 1, 249.00),
    (order_uuid2, 'samosa', 2, 89.00),
    (order_uuid2, 'samosa', 2, 89.00)
    ON CONFLICT DO NOTHING;
    
    -- Sample Transaction for completed order
    INSERT INTO transactions (table_id, order_id, amount, vat_amount, total_amount, method, status, customer_name, phone, invoice_number, notes) VALUES
    (3, gen_random_uuid(), 400.00, 72.00, 472.00, 'cash', 'completed', 'Previous Customer', '+91-9876543212', 'INV-001', 'Paid in cash')
    ON CONFLICT (invoice_number) DO NOTHING;
END $$;

-- ===============================
-- 14. UPDATE TABLE STATUSES BASED ON ORDERS
-- ===============================
UPDATE tables SET status = 'occupied' WHERE id IN (
    SELECT DISTINCT table_id FROM orders WHERE status IN ('pending', 'preparing', 'ready')
);

-- ===============================
-- 15. USEFUL QUERIES FOR DEBUGGING
-- ===============================

-- View all orders with items
CREATE OR REPLACE VIEW order_details AS
SELECT 
    o.id as order_id,
    o.table_id,
    o.total_amount,
    o.status as order_status,
    o.customer_name,
    o.phone,
    o.created_at as order_time,
    oi.menu_item_id,
    mi.name as item_name,
    oi.quantity,
    oi.price as item_price,
    (oi.quantity * oi.price) as item_total
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
ORDER BY o.created_at DESC, oi.menu_item_id;

-- View table status with current orders
CREATE OR REPLACE VIEW table_status AS
SELECT 
    t.id,
    t.name,
    t.location,
    t.capacity,
    t.status,
    COUNT(o.id) as active_orders,
    SUM(o.total_amount) as total_pending_amount
FROM tables t
LEFT JOIN orders o ON t.id = o.table_id AND o.status IN ('pending', 'preparing', 'ready')
GROUP BY t.id, t.name, t.location, t.capacity, t.status
ORDER BY t.id;

-- View recent transactions
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    t.id,
    t.table_id,
    tb.name as table_name,
    t.total_amount,
    t.method,
    t.status,
    t.customer_name,
    t.invoice_number,
    t.created_at
FROM transactions t
LEFT JOIN tables tb ON t.table_id = tb.id
ORDER BY t.created_at DESC;

-- ===============================
-- 16. MANUAL QUERIES TO RUN FOR TESTING
-- ===============================

-- Check all tables
SELECT * FROM tables ORDER BY id;

-- Check all orders with details
SELECT * FROM order_details LIMIT 20;

-- Check table status
SELECT * FROM table_status;

-- Check transactions
SELECT * FROM recent_transactions LIMIT 10;

-- Check menu items
SELECT id, name, price, category, available FROM menu_items ORDER BY category, name;

-- Check inventory
SELECT * FROM inventory ORDER BY name;

-- Count records in each table
SELECT 
    'tables' as table_name, COUNT(*) as count FROM tables
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'menu_categories', COUNT(*) FROM menu_categories
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- ===============================
-- 17. CLEANUP QUERIES (if needed)
-- ===============================

-- Clear all orders (use with caution)
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM transactions;
-- UPDATE tables SET status = 'available';

-- Reset table statuses
-- UPDATE tables SET status = 'available';

-- Clear specific table orders
-- DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE table_id = 1);
-- DELETE FROM orders WHERE table_id = 1;
-- UPDATE tables SET status = 'available' WHERE id = 1;
