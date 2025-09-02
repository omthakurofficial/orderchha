-- 🚀 UNRESTRICTED RLS POLICIES FOR ALL TABLES
-- Run this in Supabase SQL Editor for complete unrestricted access

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- 👥 USERS TABLE POLICIES
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.users;
DROP POLICY IF EXISTS "Enable update for all users" ON public.users;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.users;

CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.users FOR DELETE USING (true);

-- 📦 INVENTORY TABLE POLICIES
DROP POLICY IF EXISTS "Enable read access for all users" ON public.inventory;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.inventory;
DROP POLICY IF EXISTS "Enable update for all users" ON public.inventory;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.inventory;

CREATE POLICY "Enable read access for all users" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.inventory FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.inventory FOR DELETE USING (true);

-- 🍽️ MENU_CATEGORIES TABLE POLICIES
DROP POLICY IF EXISTS "Enable read access for all users" ON public.menu_categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.menu_categories;
DROP POLICY IF EXISTS "Enable update for all users" ON public.menu_categories;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.menu_categories;

CREATE POLICY "Enable read access for all users" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.menu_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.menu_categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.menu_categories FOR DELETE USING (true);

-- 🍜 MENU_ITEMS TABLE POLICIES
DROP POLICY IF EXISTS "Enable read access for all users" ON public.menu_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.menu_items;
DROP POLICY IF EXISTS "Enable update for all users" ON public.menu_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.menu_items;

CREATE POLICY "Enable read access for all users" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.menu_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.menu_items FOR DELETE USING (true);

-- 🛒 ORDER_ITEMS TABLE POLICIES
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable update for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.order_items;

CREATE POLICY "Enable read access for all users" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.order_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.order_items FOR DELETE USING (true);

-- 📋 ORDERS TABLE POLICIES
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.orders;

CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.orders FOR DELETE USING (true);

-- ⚙️ SETTINGS TABLE POLICIES
DROP POLICY IF EXISTS "Enable read access for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable update for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.settings;

CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.settings FOR DELETE USING (true);

-- 🪑 TABLES TABLE POLICIES
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tables;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.tables;
DROP POLICY IF EXISTS "Enable update for all users" ON public.tables;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.tables;

CREATE POLICY "Enable read access for all users" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.tables FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.tables FOR DELETE USING (true);

-- ✅ SUCCESS MESSAGE
SELECT 'All RLS policies created successfully! All tables now have unrestricted access.' as status;
