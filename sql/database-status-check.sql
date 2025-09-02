-- DATABASE STATUS CHECK SCRIPT
-- Run this to see what tables exist and what's missing

SELECT 'Checking database tables and structure...' as status;

-- Check if all required tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('menu_categories', 'menu_items', 'tables', 'orders', 'order_items', 'transactions', 'settings', 'inventory', 'users') 
    THEN '✅ Required'
    ELSE '⚠️ Optional'
  END as importance
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check for missing critical tables
SELECT 'Missing Critical Tables:' as check_type;

WITH required_tables AS (
  SELECT unnest(ARRAY['menu_categories', 'menu_items', 'tables', 'orders', 'order_items', 'transactions', 'settings', 'inventory', 'users']) as table_name
),
existing_tables AS (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
)
SELECT 
  rt.table_name as missing_table,
  CASE rt.table_name
    WHEN 'transactions' THEN '🚨 CRITICAL - Required for billing payments'
    WHEN 'orders' THEN '🚨 CRITICAL - Required for order management'
    WHEN 'order_items' THEN '🚨 CRITICAL - Required for order details'
    WHEN 'menu_items' THEN '🚨 CRITICAL - Required for menu display'
    WHEN 'tables' THEN '🚨 CRITICAL - Required for table management'
    WHEN 'menu_categories' THEN '⚠️ IMPORTANT - Required for menu organization'
    WHEN 'settings' THEN '⚠️ IMPORTANT - Required for app configuration'
    WHEN 'inventory' THEN '📦 OPTIONAL - Required for inventory tracking'
    WHEN 'users' THEN '👤 OPTIONAL - Required for user management'
  END as impact
FROM required_tables rt
LEFT JOIN existing_tables et ON rt.table_name = et.table_name
WHERE et.table_name IS NULL;

-- Check table data counts
SELECT 'Data Status Check:' as check_type;

DO $$
DECLARE
    table_name text;
    row_count integer;
    sql_query text;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name
    LOOP
        sql_query := 'SELECT COUNT(*) FROM ' || quote_ident(table_name);
        EXECUTE sql_query INTO row_count;
        
        RAISE NOTICE '📊 Table %: % rows', table_name, row_count;
        
        -- Check for empty critical tables
        IF table_name IN ('menu_items', 'tables') AND row_count = 0 THEN
            RAISE NOTICE '⚠️ WARNING: % table is empty - this will cause display issues!', table_name;
        END IF;
        
        IF table_name = 'transactions' AND row_count = 0 THEN
            RAISE NOTICE 'ℹ️ INFO: % table is empty - this is normal for new setup', table_name;
        END IF;
    END LOOP;
END $$;

-- Check for foreign key constraints
SELECT 'Foreign Key Constraints Check:' as check_type;

SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- Check for indexes
SELECT 'Database Indexes Check:' as check_type;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check RLS (Row Level Security) status
SELECT 'Row Level Security Status:' as check_type;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '🔒 Enabled'
        ELSE '🔓 Disabled'
    END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT 'Database check completed!' as final_status;
