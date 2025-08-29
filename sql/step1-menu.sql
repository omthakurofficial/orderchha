-- STEP 1: Create Menu Categories and Items Tables
-- Copy and run this first

CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  image_hint VARCHAR(100),
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Menu Categories
INSERT INTO menu_categories (id, name, icon) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '🍕 Pizzas', 'Flame'),
  ('550e8400-e29b-41d4-a716-446655440002', '🥤 Beverages', 'GlassWater'),
  ('550e8400-e29b-41d4-a716-446655440003', '🍟 Snacks & Appetizers', 'Pizza'),
  ('550e8400-e29b-41d4-a716-446655440004', '🍰 Desserts', 'IceCream2');
