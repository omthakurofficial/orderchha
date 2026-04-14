-- OrderChha canonical seed data (idempotent)
-- Run this after 01-core-schema.sql

insert into menu_categories (id, name, icon) values
  ('550e8400-e29b-41d4-a716-446655440001', 'Pizzas', 'Flame'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Beverages', 'GlassWater'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Snacks and Appetizers', 'Pizza'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Desserts', 'IceCream2')
on conflict (id) do nothing;

insert into users (
  uid, name, email, role, country, nationality, mobile, designation,
  employee_id, department, languages_spoken, highest_education,
  institute_name, skills, active
) values
  (
    'admin-nepal-001',
    'Admin User',
    'admin@orderchha.cafe',
    'admin',
    'Nepal',
    'Nepali',
    '+977 9876543210',
    'Restaurant Owner and Manager',
    'ADM001',
    'Management',
    'Nepali, Hindi, English',
    'bachelor',
    'Tribhuvan University',
    'Restaurant management, Team leadership, Financial planning',
    true
  ),
  (
    'staff-nepal-001',
    'Staff User',
    'staff@orderchha.cafe',
    'waiter',
    'Nepal',
    'Nepali',
    '+977 9812345678',
    'Senior Waiter',
    'STF001',
    'Service',
    'Nepali, Hindi, English',
    'higher_secondary',
    'Kathmandu Model College',
    'Customer service, Order management, Multi-lingual communication',
    true
  )
on conflict (uid) do nothing;

insert into menu_items (id, category_id, name, description, price, image, image_url, image_hint, in_stock, available) values
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Margherita Classic', 'Fresh mozzarella, tomato sauce, basil', 450.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', 'margherita pizza', true, true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Pepperoni Supreme', 'Spicy pepperoni with extra cheese', 550.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', 'pepperoni pizza', true, true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Steam Momo', 'Traditional dumplings (10 pieces)', 200.00, 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop', 'steamed momo', true, true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Coca-Cola', 'Classic cola drink', 80.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop', 'cola bottle', true, true)
on conflict do nothing;

insert into tables (id, name, location, status, capacity) values
  (1, 'Table 1', 'Ground Floor', 'available', 4),
  (2, 'Table 2', 'Ground Floor', 'available', 2),
  (3, 'Table 3', 'Ground Floor', 'available', 6),
  (4, 'Table 4', 'Ground Floor', 'available', 4),
  (5, 'Table 5', 'First Floor', 'available', 2),
  (6, 'Table 6', 'First Floor', 'available', 4),
  (7, 'Table 7', 'First Floor', 'available', 8),
  (8, 'Table 8', 'Outdoor', 'available', 6),
  (9, 'Table 9', 'Outdoor', 'available', 4),
  (10, 'Table 10', 'Ground Floor', 'available', 2)
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('tables', 'id'), coalesce((select max(id) from tables), 1), true);

insert into settings (id, cafe_name, address, phone, currency, tax_rate, service_charge, receipt_note, ai_suggestions_enabled, online_ordering_enabled)
values ('app-settings', 'OrderChha Restaurant', 'Thamel, Kathmandu, Nepal', '+977-01-4444444', 'NPR', 0.13, 0.10, 'Thank you for dining with OrderChha.', true, true)
on conflict (id) do update set
  cafe_name = excluded.cafe_name,
  address = excluded.address,
  phone = excluded.phone,
  currency = excluded.currency,
  tax_rate = excluded.tax_rate,
  service_charge = excluded.service_charge,
  receipt_note = excluded.receipt_note,
  ai_suggestions_enabled = excluded.ai_suggestions_enabled,
  online_ordering_enabled = excluded.online_ordering_enabled,
  updated_at = now();

insert into inventory (name, quantity, unit, min_quantity, max_quantity, supplier, cost_price)
values
  ('Pizza Dough', 50, 'kg', 10, 100, 'Local Supplier', 80.00),
  ('Mozzarella Cheese', 25, 'kg', 5, 50, 'Dairy Co.', 450.00),
  ('Chicken', 30, 'kg', 10, 60, 'Meat Supplier', 320.00),
  ('Vegetables Mix', 40, 'kg', 15, 80, 'Fresh Farms', 120.00),
  ('Coca-Cola', 100, 'bottles', 20, 200, 'Beverage Co.', 35.00)
on conflict do nothing;
