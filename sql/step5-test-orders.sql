-- STEP 5: INSERT TEST ORDERS FOR NOTIFICATIONS
-- Run this to create test orders that will show notification badges

-- Clear any existing orders first
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM transactions;

-- Insert test orders with specific UUIDs for consistency
INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 598.00, 'pending', 'John Doe', '+91-9876543210', 'Waiting for confirmation'),
  ('22222222-2222-2222-2222-222222222222', 2, 427.00, 'preparing', 'Jane Smith', '+91-9876543211', 'Being prepared in kitchen'),
  ('33333333-3333-3333-3333-333333333333', 3, 349.00, 'ready', 'Bob Johnson', '+91-9876543212', 'Ready for billing');

-- Insert order items for each order
INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
  -- Order 1 items (pending)
  ('11111111-1111-1111-1111-111111111111', 'pizza-margherita', 2, 299.00),
  
  -- Order 2 items (preparing)
  ('22222222-2222-2222-2222-222222222222', 'pasta-carbonara', 1, 249.00),
  ('22222222-2222-2222-2222-222222222222', 'samosa', 2, 89.00),
  
  -- Order 3 items (ready)
  ('33333333-3333-3333-3333-333333333333', 'chicken-tikka', 1, 329.00),
  ('33333333-3333-3333-3333-333333333333', 'masala-chai', 4, 49.00);

-- Update table statuses
UPDATE tables SET status = 'occupied' WHERE id IN (1, 2);
UPDATE tables SET status = 'billing' WHERE id = 3;

-- Insert a sample transaction to test receipt printing (using existing order)
INSERT INTO transactions (table_id, order_id, amount, vat_amount, total_amount, method, status, customer_name, phone, invoice_number, notes) 
VALUES (4, '33333333-3333-3333-3333-333333333333', 349.00, 62.82, 411.82, 'cash', 'completed', 'Bob Johnson', '+91-9876543212', 'INV-001', 'Sample transaction for testing');

-- Verify the data
SELECT 'Notification Counts' as info;
SELECT 'Confirm Orders' as section, COUNT(*) as badge_count FROM orders WHERE status = 'pending'
UNION ALL
SELECT 'Kitchen Orders', COUNT(*) FROM orders WHERE status IN ('preparing', 'ready')
UNION ALL  
SELECT 'Billing Ready', COUNT(*) FROM orders WHERE status = 'ready'
UNION ALL
SELECT 'Tables for Billing', COUNT(*) FROM tables WHERE status = 'billing';

-- Check orders by status
SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY status;
