-- MANUAL QUERIES TO CHECK AND POPULATE DATABASE
-- Copy and paste these queries in your Supabase SQL editor

-- ===============================
-- 1. CHECK CURRENT DATA STATUS
-- ===============================

-- Check what tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check if transactions table exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- Count records in each table
SELECT 'tables' as table_name, COUNT(*) as count FROM tables
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
-- 2. CREATE TRANSACTIONS TABLE (if missing)
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

-- ===============================
-- 3. DISABLE RLS FOR ALL TABLES (UNRESTRICTED ACCESS)
-- ===============================

ALTER TABLE IF EXISTS inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions DISABLE ROW LEVEL SECURITY;

-- ===============================
-- 4. GRANT UNRESTRICTED PERMISSIONS
-- ===============================

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ===============================
-- 5. ADD SAMPLE ORDERS FOR TESTING
-- ===============================

-- Insert some test orders
DO $$
DECLARE
    order_uuid1 UUID := gen_random_uuid();
    order_uuid2 UUID := gen_random_uuid();
    order_uuid3 UUID := gen_random_uuid();
BEGIN
    -- Pending Order (Confirm Orders section)
    INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) VALUES
    (order_uuid1, 1, 598.00, 'pending', 'John Doe', '+91-9876543210', '2 pizzas ordered');
    
    INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
    (order_uuid1, 'pizza-margherita', 2, 299.00);
    
    -- Kitchen Order (Kitchen section)
    INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) VALUES
    (order_uuid2, 2, 427.00, 'preparing', 'Jane Smith', '+91-9876543211', '3 items ordered');
    
    INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
    (order_uuid2, 'pasta-carbonara', 1, 249.00),
    (order_uuid2, 'samosa', 2, 89.00);
    
    -- Ready Order (Kitchen -> Billing)
    INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) VALUES
    (order_uuid3, 3, 349.00, 'ready', 'Bob Johnson', '+91-9876543212', '2 items ready');
    
    INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
    (order_uuid3, 'chicken-tikka', 1, 329.00),
    (order_uuid3, 'masala-chai', 1, 49.00);
    
    -- Update table statuses
    UPDATE tables SET status = 'occupied' WHERE id = 1;
    UPDATE tables SET status = 'occupied' WHERE id = 2;
    UPDATE tables SET status = 'billing' WHERE id = 3;
    
END $$;

-- ===============================
-- 6. VIEW ALL CURRENT DATA
-- ===============================

-- Check orders with details
SELECT 
    o.id,
    o.table_id,
    o.status,
    o.total_amount,
    o.customer_name,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.table_id, o.status, o.total_amount, o.customer_name, o.created_at
ORDER BY o.created_at DESC;

-- Check table statuses
SELECT id, name, status FROM tables ORDER BY id;

-- Check transactions
SELECT * FROM transactions ORDER BY created_at DESC;

-- ===============================
-- 7. QUERIES TO TEST NOTIFICATION COUNTS
-- ===============================

-- Count pending orders (Confirm Orders badge)
SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending';

-- Count kitchen orders (Kitchen badge)
SELECT COUNT(*) as kitchen_orders FROM orders WHERE status IN ('preparing', 'ready');

-- Count billing orders (Billing badge)
SELECT COUNT(*) as billing_orders FROM orders WHERE status = 'ready'
UNION ALL
SELECT COUNT(*) FROM tables WHERE status = 'billing';

-- ===============================
-- 8. MANUAL DATA INSERTION FOR IMMEDIATE TESTING
-- ===============================

-- Insert a pending order for immediate testing
INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) 
VALUES (gen_random_uuid(), 4, 299.00, 'pending', 'Test Customer', '+91-1234567890', 'Test order for notifications');

-- Insert order items for the test order
INSERT INTO order_items (order_id, menu_item_id, quantity, price) 
SELECT o.id, 'pizza-margherita', 1, 299.00 
FROM orders o 
WHERE o.customer_name = 'Test Customer' 
ORDER BY o.created_at DESC 
LIMIT 1;

-- Update table status
UPDATE tables SET status = 'occupied' WHERE id = 4;

-- ===============================
-- 9. QUERIES TO SIMULATE WORKFLOW
-- ===============================

-- Move order from pending to preparing (Confirm -> Kitchen)
UPDATE orders SET status = 'preparing' WHERE status = 'pending' AND table_id = 4;

-- Move order from preparing to ready (Kitchen progress)
UPDATE orders SET status = 'ready' WHERE status = 'preparing' AND table_id = 4;

-- Move table to billing status (Kitchen -> Billing)
UPDATE tables SET status = 'billing' WHERE id = 4;
UPDATE orders SET status = 'completed' WHERE status = 'ready' AND table_id = 4;

-- Complete billing cycle (reset table)
UPDATE tables SET status = 'available' WHERE id = 4;

-- ===============================
-- 10. CHECK FINAL STATE
-- ===============================

-- Final check - view all data
SELECT 'TABLES' as section, id::text, name as description, status as current_status FROM tables
UNION ALL
SELECT 'ORDERS', id::text, 'Table ' || table_id::text, status FROM orders
UNION ALL
SELECT 'TRANSACTIONS', id::text, 'Table ' || table_id::text, status FROM transactions
ORDER BY section, id;
