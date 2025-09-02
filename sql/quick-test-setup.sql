-- QUICK TEST SETUP FOR ORDERCHHA
-- Run these queries one by one in Supabase SQL editor

-- ===============================
-- STEP 1: CLEAR AND SETUP
-- ===============================

-- Delete existing test data
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM transactions;
UPDATE tables SET status = 'available';

-- ===============================
-- STEP 2: DISABLE RLS (UNRESTRICTED ACCESS)
-- ===============================

ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- ===============================
-- STEP 3: CREATE TRANSACTIONS TABLE
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
-- STEP 4: INSERT TEST ORDERS
-- ===============================

-- Test Order 1: PENDING (will show in Confirm Orders with badge)
INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) 
VALUES ('11111111-1111-1111-1111-111111111111', 1, 598.00, 'pending', 'John Doe', '+91-9876543210', 'Needs confirmation');

INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
('11111111-1111-1111-1111-111111111111', 'pizza-margherita', 2, 299.00);

-- Test Order 2: PREPARING (will show in Kitchen with badge)
INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) 
VALUES ('22222222-2222-2222-2222-222222222222', 2, 427.00, 'preparing', 'Jane Smith', '+91-9876543211', 'In kitchen');

INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
('22222222-2222-2222-2222-222222222222', 'pasta-carbonara', 1, 249.00),
('22222222-2222-2222-2222-222222222222', 'samosa', 2, 89.00);

-- Test Order 3: READY (will show in Billing with badge)
INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) 
VALUES ('33333333-3333-3333-3333-333333333333', 3, 349.00, 'ready', 'Bob Johnson', '+91-9876543212', 'Ready for billing');

INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
('33333333-3333-3333-3333-333333333333', 'chicken-tikka', 1, 329.00),
('33333333-3333-3333-3333-333333333333', 'masala-chai', 1, 49.00);

-- Update table statuses
UPDATE tables SET status = 'occupied' WHERE id IN (1, 2);
UPDATE tables SET status = 'billing' WHERE id = 3;

-- ===============================
-- STEP 5: VERIFY DATA
-- ===============================

-- Check notification counts
SELECT 'Confirm Orders Badge' as section, COUNT(*) as count FROM orders WHERE status = 'pending'
UNION ALL
SELECT 'Kitchen Badge', COUNT(*) FROM orders WHERE status IN ('preparing', 'ready')  
UNION ALL
SELECT 'Billing Badge', COUNT(*) FROM orders WHERE status = 'ready' OR EXISTS (SELECT 1 FROM tables WHERE status = 'billing');

-- Check orders details
SELECT 
    o.id,
    o.table_id,
    o.status,
    o.total_amount,
    o.customer_name,
    t.status as table_status
FROM orders o
JOIN tables t ON o.table_id = t.id
ORDER BY o.created_at;

-- ===============================
-- STEP 6: SIMULATE WORKFLOW (OPTIONAL)
-- ===============================

-- To test the workflow, run these queries one by one:

-- 1. Confirm pending order (moves to kitchen)
-- UPDATE orders SET status = 'preparing' WHERE id = '11111111-1111-1111-1111-111111111111';

-- 2. Kitchen marks order as ready
-- UPDATE orders SET status = 'ready' WHERE id = '22222222-2222-2222-2222-222222222222';

-- 3. Complete order and move to billing
-- UPDATE orders SET status = 'completed' WHERE id = '33333333-3333-3333-3333-333333333333';
-- UPDATE tables SET status = 'billing' WHERE id = 3;

-- 4. Process payment
-- INSERT INTO transactions (table_id, order_id, amount, vat_amount, total_amount, method, customer_name, invoice_number)
-- VALUES (3, '33333333-3333-3333-3333-333333333333', 349.00, 34.90, 383.90, 'cash', 'Bob Johnson', 'INV-' || extract(epoch from now()));

-- 5. Reset table after payment
-- UPDATE tables SET status = 'available' WHERE id = 3;
