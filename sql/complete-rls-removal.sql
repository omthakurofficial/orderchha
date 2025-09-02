-- COMPLETE RLS REMOVAL - Run this entire script in Supabase SQL Editor

-- Step 1: Disable RLS on ALL tables
ALTER TABLE IF EXISTS public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (this removes all restrictions)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Step 3: Grant FULL permissions to all roles
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Step 4: Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS_ENABLED"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Step 5: Test data access
SELECT COUNT(*) as total_orders FROM public.orders;
SELECT COUNT(*) as total_tables FROM public.tables;
SELECT COUNT(*) as total_menu_items FROM public.menu_items;

-- Step 6: Show current orders by status
SELECT 
  status,
  COUNT(*) as count,
  COALESCE(SUM(total_amount), 0) as total_value
FROM public.orders 
GROUP BY status
ORDER BY status;
