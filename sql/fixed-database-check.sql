-- Fixed SQL Queries - Run these step by step

-- 1. Disable RLS on all tables
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;

-- 3. Check what tables exist and their columns
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'tables'
ORDER BY table_name, ordinal_position;

-- 4. Check orders by status
SELECT 
  status,
  COUNT(*) as count,
  COALESCE(SUM(total_amount), 0) as total_value
FROM public.orders 
GROUP BY status
ORDER BY status;

-- 5. Check recent orders
SELECT 
  o.id,
  o.table_id,
  o.status,
  o.total_amount,
  o.created_at,
  o.customer_name
FROM public.orders o
ORDER BY o.created_at DESC
LIMIT 10;

-- 6. Check billing-ready orders (corrected)
SELECT 
  o.id,
  o.table_id,
  o.status,
  o.total_amount,
  o.created_at,
  t.name as table_name,
  t.status as table_status
FROM public.orders o
LEFT JOIN public.tables t ON o.table_id = t.id
WHERE o.status = 'ready'
ORDER BY o.created_at DESC;

-- 7. Check all tables
SELECT 
  id,
  name,
  capacity,
  status
FROM public.tables
ORDER BY id;
