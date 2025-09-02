-- VERIFICATION: Check if everything is working
-- Run this to verify your database setup

-- 1. Check all tables exist
SELECT 
    table_name,
    CASE WHEN table_name IN ('menu_categories', 'menu_items', 'tables', 'orders', 'order_items', 'transactions', 'inventory', 'users', 'settings') 
         THEN '✅ Required' 
         ELSE '⚠️ Optional' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check record counts
SELECT 'Table Counts:' as info;
SELECT 
    'menu_categories' as table_name, COUNT(*) as records FROM menu_categories
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items  
UNION ALL
SELECT 'tables', COUNT(*) FROM tables
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'settings', COUNT(*) FROM settings;

-- 3. Check notification badge counts
SELECT 'Badge Counts for Sidebar:' as info;
SELECT 'Confirm Orders Badge' as section, COUNT(*) as count FROM orders WHERE status = 'pending'
UNION ALL
SELECT 'Kitchen Badge', COUNT(*) FROM orders WHERE status IN ('preparing', 'ready')
UNION ALL
SELECT 'Billing Badge', COUNT(*) FROM orders WHERE status = 'ready'
UNION ALL
SELECT 'Tables in Billing', COUNT(*) FROM tables WHERE status = 'billing';

-- 4. Check sample orders
SELECT 'Sample Orders:' as info;
SELECT 
    o.id,
    o.table_id,
    o.status,
    o.customer_name,
    o.total_amount,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.table_id, o.status, o.customer_name, o.total_amount
ORDER BY o.created_at;

-- 5. Check table statuses
SELECT 'Table Statuses:' as info;
SELECT id, name, status FROM tables ORDER BY id;
