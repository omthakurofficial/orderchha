-- Clean up script to remove all existing data
-- This will clear all orders, order_items, transactions, and reset tables

-- First, delete all data in the correct order (due to foreign key constraints)
DELETE FROM transactions;
DELETE FROM order_items;
DELETE FROM orders;

-- Reset table statuses to 'available'
UPDATE tables SET status = 'available' WHERE status != 'available';

-- Optional: Reset auto-increment sequences if needed
-- ALTER SEQUENCE orders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
-- ALTER SEQUENCE transactions_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT 'orders' as table_name, count(*) as count FROM orders
UNION ALL
SELECT 'order_items' as table_name, count(*) as count FROM order_items  
UNION ALL
SELECT 'transactions' as table_name, count(*) as count FROM transactions
UNION ALL
SELECT 'tables' as table_name, count(*) as available_tables FROM tables WHERE status = 'available';

SELECT 'Cleanup completed successfully!' as result;
