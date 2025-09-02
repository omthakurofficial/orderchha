-- Comprehensive Database Check and Fix
-- Run this to diagnose and fix all issues

-- ==== STEP 1: Fix RLS Issues ====
-- Disable Row Level Security on all tables
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated and anonymous users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;

-- ==== STEP 2: Check Current Data ====
-- Check orders by status
SELECT 
  status,
  COUNT(*) as count,
  SUM(total_amount) as total_value
FROM public.orders 
GROUP BY status
ORDER BY status;

-- Check recent orders with details
SELECT 
  o.id,
  o.table_id,
  o.status,
  o.total_amount,
  o.created_at,
  o.customer_name,
  COUNT(oi.id) as item_count
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.table_id, o.status, o.total_amount, o.created_at, o.customer_name
ORDER BY o.created_at DESC
LIMIT 10;

-- Check table statuses
SELECT 
  status,
  COUNT(*) as count
FROM public.tables 
GROUP BY status;

-- Check if there are billing-ready orders (status = 'ready')
SELECT 
  o.id,
  o.table_id,
  o.status,
  o.total_amount,
  o.created_at,
  t.name as table_name,
  t.status as table_status
FROM public.orders o
JOIN public.tables t ON o.table_id = t.id
WHERE o.status = 'ready'
ORDER BY o.created_at DESC;

-- Check recent transactions
SELECT 
  t.id,
  t.table_id,
  t.order_id,
  t.total_amount,
  t.method,
  t.created_at,
  tb.name as table_name
FROM public.transactions t
JOIN public.tables tb ON t.table_id = tb.id
ORDER BY t.created_at DESC
LIMIT 5;
