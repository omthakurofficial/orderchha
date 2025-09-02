-- SIMPLE TEST ORDERS - NO FOREIGN KEY ISSUES
-- Run this instead of step5-test-orders.sql

-- Clear existing orders first
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM transactions;

-- Reset all table statuses
UPDATE tables SET status = 'available';

-- Insert test orders with specific UUIDs
INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 598.00, 'pending', 'John Doe', '+91-9876543210', 'Waiting for confirmation'),
  ('22222222-2222-2222-2222-222222222222', 2, 427.00, 'preparing', 'Jane Smith', '+91-9876543211', 'Being prepared in kitchen'),
  ('33333333-3333-3333-3333-333333333333', 3, 349.00, 'ready', 'Bob Johnson', '+91-9876543212', 'Ready for billing');

-- Insert order items for each order
INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
  -- Order 1 items (pending - will show in Confirm Orders)
  ('11111111-1111-1111-1111-111111111111', 'pizza-margherita', 2, 299.00),
  
  -- Order 2 items (preparing - will show in Kitchen)
  ('22222222-2222-2222-2222-222222222222', 'pasta-carbonara', 1, 249.00),
  ('22222222-2222-2222-2222-222222222222', 'samosa', 2, 89.00),
  
  -- Order 3 items (ready - will show in Billing)
  ('33333333-3333-3333-3333-333333333333', 'chicken-tikka', 1, 329.00),
  ('33333333-3333-3333-3333-333333333333', 'masala-chai', 4, 49.00);

-- Update table statuses based on orders
UPDATE tables SET status = 'occupied' WHERE id IN (1, 2);
UPDATE tables SET status = 'billing' WHERE id = 3;

-- Add a simple transaction WITHOUT order_id reference (to avoid foreign key issue)
INSERT INTO transactions (table_id, amount, vat_amount, total_amount, method, status, customer_name, phone, invoice_number, notes) 
VALUES (5, 299.00, 53.82, 352.82, 'cash', 'completed', 'Previous Customer', '+91-9876543213', 'INV-' || extract(epoch from now()), 'Sample completed transaction');

-- Verify everything worked
SELECT '🎯 NOTIFICATION BADGE COUNTS:' as result;

SELECT 'Confirm Orders Badge' as section, COUNT(*) as count FROM orders WHERE status = 'pending'
UNION ALL
SELECT 'Kitchen Badge', COUNT(*) FROM orders WHERE status IN ('preparing', 'ready')
UNION ALL
SELECT 'Billing Badge', COUNT(*) FROM orders WHERE status = 'ready'
UNION ALL
SELECT 'Tables for Billing', COUNT(*) FROM tables WHERE status = 'billing';

-- Show order details
SELECT '📋 ORDER DETAILS:' as result;
SELECT 
    o.table_id,
    o.status,
    o.customer_name,
    o.total_amount,
    COUNT(oi.id) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.table_id, o.status, o.customer_name, o.total_amount
ORDER BY o.table_id;
