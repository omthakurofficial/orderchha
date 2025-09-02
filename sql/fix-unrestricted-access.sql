-- Fix Unrestricted Access Issues
-- Run this in Supabase SQL Editor to remove RLS restrictions

-- Disable RLS on all tables to allow unrestricted access
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.inventory;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.inventory;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.inventory;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.inventory;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.menu_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.menu_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.menu_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.menu_categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.menu_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.menu_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.menu_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.menu_items;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.order_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.order_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.order_items;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.settings;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.tables;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.tables;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.tables;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.tables;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.transactions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.transactions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.transactions;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.users;

-- Grant full permissions to authenticated and anon users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify tables are accessible
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
