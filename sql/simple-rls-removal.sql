-- Remove RLS from all tables and grant permissions
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Drop all policies if they exist
DROP POLICY IF EXISTS "Public read access for tables" ON tables;
DROP POLICY IF EXISTS "Public read access for menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public access for orders" ON orders;
DROP POLICY IF EXISTS "Public access for order_items" ON order_items;
DROP POLICY IF EXISTS "Public access for transactions" ON transactions;
DROP POLICY IF EXISTS "Public access for profiles" ON profiles;
