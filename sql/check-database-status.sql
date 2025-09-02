-- SIMPLE QUERIES TO CHECK DATABASE STATUS
-- Copy and paste these in Supabase SQL editor

-- 1. Check if all required tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('tables', 'orders', 'order_items', 'menu_items', 'menu_categories', 'inventory', 'transactions', 'users', 'settings') 
        THEN '✅ Required'
        ELSE '⚠️ Optional'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check current record counts
SELECT 
    'tables' as table_name, 
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ Has Data' ELSE '❌ Empty' END as status
FROM tables
UNION ALL
SELECT 'orders', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ Has Data' ELSE '❌ Empty' END FROM orders
UNION ALL
SELECT 'order_items', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ Has Data' ELSE '❌ Empty' END FROM order_items
UNION ALL
SELECT 'menu_items', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ Has Data' ELSE '❌ Empty' END FROM menu_items
UNION ALL
SELECT 'transactions', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ Has Data' ELSE '❌ Empty' END FROM transactions;

-- 3. Check current orders by status (for notifications)
SELECT 
    status,
    COUNT(*) as count,
    'Badge Count: ' || COUNT(*) as notification_info
FROM orders 
GROUP BY status
ORDER BY status;

-- 4. Check table statuses
SELECT 
    id,
    name,
    status,
    CASE 
        WHEN status = 'occupied' THEN '🔴 Busy'
        WHEN status = 'billing' THEN '💰 Billing'
        WHEN status = 'available' THEN '✅ Free'
        ELSE status
    END as display_status
FROM tables 
ORDER BY id;

-- 5. Quick test data insertion (run if tables are empty)
-- Run this if you need test data immediately:

/*
-- Insert test orders for immediate testing
INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 299.00, 'pending', 'Test Pending', '+91-1111111111', 'Confirm order test'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 399.00, 'preparing', 'Test Kitchen', '+91-2222222222', 'Kitchen order test'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 499.00, 'ready', 'Test Billing', '+91-3333333333', 'Billing order test');

-- Insert corresponding order items
INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pizza-margherita', 1, 299.00),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pasta-carbonara', 1, 249.00),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'samosa', 3, 50.00),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'chicken-tikka', 1, 329.00),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'veg-biryani', 1, 170.00);

-- Update table statuses
UPDATE tables SET status = 'occupied' WHERE id IN (1, 2);
UPDATE tables SET status = 'billing' WHERE id = 3;
*/
