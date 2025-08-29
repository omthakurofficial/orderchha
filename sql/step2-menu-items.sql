-- STEP 2: Insert Menu Items
-- Run this after Step 1 is successful

INSERT INTO menu_items (id, category_id, name, description, price, image, image_hint, in_stock) VALUES
  -- Pizzas
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Margherita Classic', 'Fresh mozzarella, tomato sauce, basil', 450.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', 'margherita pizza', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Pepperoni Supreme', 'Spicy pepperoni with extra cheese', 550.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', 'pepperoni pizza', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Veggie Garden', 'Bell peppers, mushrooms, onions, olives', 500.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', 'vegetable pizza', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Chicken BBQ', 'Grilled chicken with BBQ sauce', 600.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', 'bbq chicken pizza', true),
  
  -- Beverages
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Coca-Cola', 'Classic cola drink', 80.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop', 'cola bottle', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 120.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop', 'orange juice glass', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Mineral Water', 'Pure mineral water', 50.00, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop', 'water bottle', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Sweet Lassi', 'Traditional Nepali yogurt drink', 100.00, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop', 'lassi glass', true),
  
  -- Snacks & Appetizers
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'French Fries', 'Crispy golden potato fries', 150.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', 'french fries', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Chicken Wings', 'Spicy buffalo wings (6 pieces)', 350.00, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop', 'chicken wings', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Steam Momo', 'Traditional Nepali dumplings (10 pieces)', 200.00, 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop', 'steamed momo', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Fried Momo', 'Crispy fried dumplings (10 pieces)', 220.00, 'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=400&h=300&fit=crop', 'fried momo', true),
  
  -- Desserts
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Chocolate Brownie', 'Rich chocolate brownie with vanilla ice cream', 180.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', 'chocolate brownie', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Kulfi Ice Cream', 'Traditional Indian ice cream', 120.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', 'kulfi ice cream', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Gulab Jamun', 'Sweet milk-based balls in syrup (4 pieces)', 150.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop', 'gulab jamun', true);
