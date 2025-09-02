-- STEP 4: INSERT SAMPLE DATA
-- Run this to populate your database with test data

-- Insert menu categories
INSERT INTO menu_categories (id, name, description, display_order) VALUES
  ('starters', 'Starters', 'Appetizers and small plates', 1),
  ('mains', 'Main Courses', 'Primary dishes and entrees', 2),
  ('desserts', 'Desserts', 'Sweet treats and desserts', 3),
  ('beverages', 'Beverages', 'Drinks and beverages', 4),
  ('specials', 'Today''s Specials', 'Chef''s special recommendations', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- Insert menu items
INSERT INTO menu_items (id, name, description, price, category, image_url, available, preparation_time) VALUES
  ('pizza-margherita', 'Margherita Pizza', 'Fresh tomatoes, mozzarella, basil', 299.00, 'mains', '/images/pizza-margherita.jpg', true, 15),
  ('pasta-carbonara', 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 249.00, 'mains', '/images/pasta-carbonara.jpg', true, 12),
  ('chicken-tikka', 'Chicken Tikka', 'Grilled chicken with Indian spices', 329.00, 'mains', '/images/chicken-tikka.jpg', true, 20),
  ('veg-biryani', 'Vegetable Biryani', 'Fragrant rice with mixed vegetables', 199.00, 'mains', '/images/veg-biryani.jpg', true, 25),
  ('samosa', 'Samosa (2 pcs)', 'Crispy fried pastry with potato filling', 89.00, 'starters', '/images/samosa.jpg', true, 8),
  ('paneer-tikka', 'Paneer Tikka', 'Grilled cottage cheese with spices', 179.00, 'starters', '/images/paneer-tikka.jpg', true, 15),
  ('masala-chai', 'Masala Chai', 'Spiced Indian tea', 49.00, 'beverages', '/images/masala-chai.jpg', true, 5),
  ('fresh-lime-soda', 'Fresh Lime Soda', 'Refreshing lime drink', 59.00, 'beverages', '/images/lime-soda.jpg', true, 3),
  ('gulab-jamun', 'Gulab Jamun (2 pcs)', 'Sweet milk dumplings in syrup', 99.00, 'desserts', '/images/gulab-jamun.jpg', true, 5),
  ('ice-cream', 'Vanilla Ice Cream', 'Premium vanilla ice cream', 89.00, 'desserts', '/images/ice-cream.jpg', true, 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  available = EXCLUDED.available,
  preparation_time = EXCLUDED.preparation_time;

-- Insert tables
INSERT INTO tables (id, name, location, capacity, status) VALUES
  (1, 'Table 1', 'Main Hall', 4, 'available'),
  (2, 'Table 2', 'Main Hall', 6, 'available'),
  (3, 'Table 3', 'Garden', 4, 'available'),
  (4, 'Table 4', 'Private Room', 8, 'available'),
  (5, 'Table 5', 'Terrace', 2, 'available'),
  (6, 'Table 6', 'Main Hall', 4, 'available'),
  (7, 'Table 7', 'Garden', 6, 'available'),
  (8, 'Table 8', 'Private Room', 10, 'available')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  capacity = EXCLUDED.capacity;

-- Insert inventory items
INSERT INTO inventory (id, name, quantity, unit, min_quantity, max_quantity, supplier) VALUES
  ('pizza-dough-001', 'Pizza Dough', 50, 'kg', 10, 100, 'Local Supplier'),
  ('vegetables-mix-001', 'Vegetables Mix', 40, 'kg', 15, 80, 'Fresh Farms'),
  ('mozzarella-cheese-001', 'Mozzarella Cheese', 25, 'kg', 5, 50, 'Dairy Co.'),
  ('coca-cola-001', 'Coca-Cola', 100, 'bottles', 20, 200, 'Beverage Co.'),
  ('chicken-fresh-001', 'Chicken', 30, 'kg', 10, 60, 'Meat Supplier')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  min_quantity = EXCLUDED.min_quantity,
  max_quantity = EXCLUDED.max_quantity,
  supplier = EXCLUDED.supplier;

-- Insert basic settings
INSERT INTO settings (cafe_name, address, phone, currency, tax_rate, service_charge) VALUES
  ('Sips & Slices Corner', '123 Gourmet Street, Foodie City', '+91-9876543210', 'INR', 18.00, 10.00)
ON CONFLICT DO NOTHING;

-- Insert admin user
INSERT INTO users (email, name, role) VALUES
  ('admin@orderchha.cafe', 'Admin User', 'admin')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;
