-- Quick Fix for Unrestricted Access
-- Run these commands one by one in Supabase SQL Editor

-- 1. First, check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Disable RLS on all tables (run each line separately)
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Check if there are any orders in the database
SELECT 
  id, 
  table_id, 
  status, 
  total_amount, 
  created_at,
  customer_name
FROM public.orders 
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check order items
SELECT 
  oi.id,
  oi.order_id,
  oi.menu_item_id,
  oi.quantity,
  oi.price,
  mi.name as menu_item_name
FROM public.order_items oi
LEFT JOIN public.menu_items mi ON oi.menu_item_id = mi.id
ORDER BY oi.id DESC
LIMIT 10;

-- 5. Check transactions
SELECT 
  id,
  table_id,
  order_id,
  total_amount,
  method,
  status,
  created_at
FROM public.transactions
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check tables status
SELECT 
  id,
  name,
  capacity,
  status,
  floor
FROM public.tables
ORDER BY id;
