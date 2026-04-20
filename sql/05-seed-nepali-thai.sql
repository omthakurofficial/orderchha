-- seed.sql
-- Standalone seed script for a Nepali/Thai restaurant.
-- Safe to run on Supabase: creates missing tables and seeds data idempotently.

create extension if not exists pgcrypto;

create table if not exists loyalty_settings (
  id text primary key,
  points_per_npr_ratio numeric(10,4) not null default 0.05,
  min_redemption_threshold integer not null default 100,
  points_expiry_days integer not null default 365,
  ratio numeric(10,4) default 0.05,
  min_redeem_points integer default 100,
  point_value_npr numeric(10,2) default 1.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists loyalty_settings
  add column if not exists points_per_npr_ratio numeric(10,4) default 0.05,
  add column if not exists min_redemption_threshold integer default 100,
  add column if not exists points_expiry_days integer default 365,
  add column if not exists ratio numeric(10,4) default 0.05,
  add column if not exists min_redeem_points integer default 100,
  add column if not exists point_value_npr numeric(10,2) default 1.00,
  add column if not exists updated_at timestamptz default now();

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  icon varchar(50),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(name)
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  description text not null,
  price numeric(10,2),
  price_npr numeric(10,2) not null,
  points_earned numeric(10,2) not null,
  in_stock boolean default true,
  available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(category_id, name)
);

alter table if exists menu_items
  add column if not exists updated_at timestamptz default now(),
  add column if not exists price numeric(10,2),
  add column if not exists price_npr numeric(10,2),
  add column if not exists points_earned numeric(10,2),
  add column if not exists in_stock boolean default true,
  add column if not exists available boolean default true;

do $$
begin
  insert into loyalty_settings (
    id,
    points_per_npr_ratio,
    min_redemption_threshold,
    points_expiry_days,
    ratio,
    min_redeem_points,
    point_value_npr
  )
  values ('default', 0.05, 100, 365, 0.05, 100, 1.00)
  on conflict (id) do update set
    points_per_npr_ratio = excluded.points_per_npr_ratio,
    min_redemption_threshold = excluded.min_redemption_threshold,
    points_expiry_days = excluded.points_expiry_days,
    ratio = excluded.ratio,
    min_redeem_points = excluded.min_redeem_points,
    point_value_npr = excluded.point_value_npr,
    updated_at = now();
end $$;

insert into categories (name)
select v.name
from (values ('Nepali'), ('Thai'), ('Beverages'), ('Services')) as v(name)
where not exists (
  select 1 from categories c where c.name = v.name
);

update menu_categories mc
set
  icon = v.icon,
  updated_at = now()
from (
  values
    ('Nepali', 'UtensilsCrossed'),
    ('Thai', 'UtensilsCrossed'),
    ('Beverages', 'GlassWater'),
    ('Services', 'BadgeDollarSign')
) as v(name, icon)
where mc.name = v.name;

insert into menu_categories (name, icon)
select v.name, v.icon
from (
  values
    ('Nepali', 'UtensilsCrossed'),
    ('Thai', 'UtensilsCrossed'),
    ('Beverages', 'GlassWater'),
    ('Services', 'BadgeDollarSign')
) as v(name, icon)
where not exists (
  select 1 from menu_categories mc where mc.name = v.name
);

create temporary table seed_menu_items (
  category_name text,
  name text,
  description text,
  price_npr numeric(10,2)
) on commit drop;

insert into seed_menu_items (category_name, name, description, price_npr)
  values
    ('Nepali', 'Steam Momo', 'Soft steamed dumplings with chicken filling and achar. Local Specialty, juicy and comforting.', 85.00),
    ('Nepali', 'Jhol Momo', 'Tender momos in a warm spiced broth. Local Specialty, rich and deeply satisfying.', 95.00),
    ('Nepali', 'Fried Momo', 'Crispy golden momos served with tomato sesame chutney. Local Specialty, crunchy and savory.', 110.00),
    ('Nepali', 'Chicken Choila', 'Smoky spiced chicken tossed with mustard oil and herbs. Local Specialty, bold and aromatic.', 180.00),
    ('Nepali', 'Buff Sekuwa', 'Chargrilled buffalo bites with spicy masala and fresh lemon. Local Specialty, smoky and juicy.', 220.00),
    ('Nepali', 'Pork Sekuwa', 'Tender pork skewers grilled until fragrant and juicy. Local Specialty, rustic and flavorful.', 240.00),
    ('Nepali', 'Thakali Thali', 'A wholesome thali with dal, tarkari, achar and rice. Local Specialty, hearty and complete.', 680.00),
    ('Nepali', 'Dal Bhat Tarkari', 'Classic lentils with seasonal vegetables and steamed rice. Local Specialty, homely and nourishing.', 450.00),
    ('Nepali', 'Gundruk Jhol', 'Fermented leafy greens simmered in a tangy broth. Local Specialty, earthy and comforting.', 160.00),
    ('Nepali', 'Chatamari', 'Thin rice pancake topped with spiced minced chicken and herbs. Local Specialty, crisp and savory.', 140.00),
    ('Nepali', 'Bara Platter', 'Savory lentil patties served hot with fresh chutney. Local Specialty, fluffy and satisfying.', 260.00),
    ('Nepali', 'Aloo Tama', 'Potato and bamboo shoot curry with gentle spice and tang. Local Specialty, bright and warming.', 240.00),
    ('Nepali', 'Saag Bhaji', 'Fresh seasonal greens cooked with garlic and light masala. Local Specialty, clean and fragrant.', 190.00),
    ('Nepali', 'Khasi Curry', 'Slow-cooked goat curry with rich house spices. Local Specialty, deep and soulful.', 850.00),
    ('Nepali', 'Dhido Set', 'Traditional millet dhido with ghee, tarkari and achar. Local Specialty, rustic and filling.', 420.00),
    ('Nepali', 'Masu Set', 'A hearty meat platter with rice, curry and pickle. Local Specialty, bold and satisfying.', 760.00),
    ('Nepali', 'Kalo Dal', 'Slow-simmered black lentils finished with butter and spices. Local Specialty, silky and warm.', 180.00),
    ('Nepali', 'Kinema Curry', 'Fermented soybean curry with earthy Himalayan flavor. Local Specialty, rich and unique.', 260.00),
    ('Nepali', 'Sisnu Soup', 'Himalayan nettle soup with garlic and light spice. Local Specialty, clean and restorative.', 220.00),
    ('Nepali', 'Yomari', 'Sweet rice dumplings with molasses and sesame filling. Local Specialty, soft and delightful.', 160.00),
    ('Nepali', 'Sel Roti with Achar', 'Fresh sel roti served with tangy house achar. Local Specialty, crisp and nostalgic.', 120.00),
    ('Nepali', 'Aloo Sadheko', 'Spiced potato salad with onion, coriander and sesame. Local Specialty, bright and zesty.', 90.00),
    ('Nepali', 'Kukhura Roast', 'Roasted chicken with mustard, herbs and smoky edges. Local Specialty, tender and fragrant.', 620.00),
    ('Nepali', 'Himalayan Special Thali', 'A premium feast of rice, curry, vegetables and achar. Local Specialty, generous and festive.', 900.00),
    ('Nepali', 'Fried Chhwela', 'Pan-fried spiced meat tossed in aromatic herbs. Local Specialty, deep and savory.', 210.00),
    ('Nepali', 'Local Breakfast Set', 'A comforting breakfast plate with bread, egg and achar. Local Specialty, warm and filling.', 150.00),

    ('Thai', 'Pad Thai', 'Stir-fried rice noodles with tamarind, peanut and lime. Thai Style, bright and balanced.', 180.00),
    ('Thai', 'Green Curry Chicken', 'Creamy coconut curry with basil, bamboo shoots and chicken. Thai Style, fragrant and lush.', 620.00),
    ('Thai', 'Red Curry Prawn', 'Silky red curry with prawns, chili and herbs. Thai Style, rich and lively.', 760.00),
    ('Thai', 'Tom Yum Soup', 'Hot and sour soup with mushrooms, lime and lemongrass. Thai Style, sharp and comforting.', 220.00),
    ('Thai', 'Tom Kha Gai', 'Coconut chicken soup with galangal and lime leaf. Thai Style, creamy and aromatic.', 280.00),
    ('Thai', 'Basil Chicken Rice', 'Wok-tossed chicken with holy basil over steaming rice. Thai Style, spicy and fresh.', 540.00),
    ('Thai', 'Thai Fried Rice', 'Fragrant jasmine rice stir-fried with vegetables and egg. Thai Style, savory and satisfying.', 430.00),
    ('Thai', 'Pineapple Fried Rice', 'Sweet pineapple rice with cashew and light curry aroma. Thai Style, colorful and bright.', 450.00),
    ('Thai', 'Massaman Curry', 'Mellow coconut curry with peanuts and slow-cooked meat. Thai Style, silky and deep.', 680.00),
    ('Thai', 'Panang Curry', 'Thick red curry with citrus leaf and creamy coconut. Thai Style, bold and luxurious.', 720.00),
    ('Thai', 'Thai Veg Spring Rolls', 'Crispy rolls with vegetables and sweet chili dip. Thai Style, crunchy and fresh.', 260.00),
    ('Thai', 'Crispy Garlic Prawns', 'Golden prawns tossed in garlic and pepper sauce. Thai Style, crisp and fragrant.', 690.00),
    ('Thai', 'Thai Style Noodles', 'Noodles wok-finished with soy, herbs and a gentle heat. Thai Style, glossy and savory.', 390.00),
    ('Thai', 'Lemongrass Beef Bowl', 'Tender beef with lemongrass, lime and chili. Thai Style, aromatic and punchy.', 840.00),
    ('Thai', 'Mango Sticky Rice', 'Sweet mango with coconut sticky rice and sesame. Thai Style, creamy and tropical.', 240.00),
    ('Thai', 'Thai Style Satay Skewers', 'Grilled skewers with peanut sauce and cucumber relish. Thai Style, smoky and rich.', 320.00),
    ('Thai', 'Chili Basil Tofu', 'Golden tofu in a spicy basil glaze. Thai Style, crisp and herb-forward.', 380.00),
    ('Thai', 'Coconut Soup', 'Light coconut broth with mushrooms and herbs. Thai Style, smooth and soothing.', 260.00),
    ('Thai', 'Thai Style Papaya Salad', 'Crunchy green papaya salad with chili, lime and peanut. Thai Style, zesty and refreshing.', 300.00),
    ('Thai', 'Cashew Nut Chicken', 'Stir-fried chicken with cashew, peppers and sweet sauce. Thai Style, glossy and savory.', 610.00),
    ('Thai', 'Bangkok Noodle Bowl', 'Street-style noodles with herbs, lime and a gentle chili kick. Thai Style, lively and bold.', 410.00),
    ('Thai', 'Thai Style Fish Cakes', 'Springy fish cakes served with sweet cucumber relish. Thai Style, light and fragrant.', 380.00),
    ('Thai', 'Spicy Basil Seafood', 'Seafood stir-fry with basil, chili and garlic. Thai Style, hot and aromatic.', 790.00),
    ('Thai', 'Thai Style Pineapple Chicken', 'Juicy chicken with pineapple, chili and glossy sauce. Thai Style, sweet and savory.', 850.00),
    ('Thai', 'Royal Thai Platter', 'A premium tasting platter of curry, noodles and crisp bites. Thai Style, elegant and colorful.', 900.00),
    ('Thai', 'Thai Wok Veg Medley', 'Fresh vegetables wok-tossed with lime leaf and mild chili. Thai Style, bright and wholesome.', 420.00),

    ('Beverages', 'Masala Chiya', 'Hot spiced milk tea brewed strong and fragrant.', 45.00),
    ('Beverages', 'Black Tea', 'Simple aromatic tea served fresh and hot.', 35.00),
    ('Beverages', 'Lemon Tea', 'Warm tea lifted with bright lemon and light sweetness.', 50.00),
    ('Beverages', 'Ginger Honey Tea', 'Soothing tea with ginger, honey and a clean finish.', 65.00),
    ('Beverages', 'Cold Coffee', 'Chilled coffee blended silky and smooth.', 180.00),
    ('Beverages', 'Espresso Shot', 'A bold concentrated coffee shot with rich crema.', 160.00),
    ('Beverages', 'Cappuccino', 'Foamy cappuccino with a velvety coffee body.', 190.00),
    ('Beverages', 'Iced Latte', 'Cool espresso with chilled milk and soft sweetness.', 200.00),
    ('Beverages', 'Fresh Lime Soda', 'Sparkling lime soda with a sharp refreshing twist.', 60.00),
    ('Beverages', 'Mint Lemonade', 'Cool mint lemonade with a crisp citrus finish.', 75.00),
    ('Beverages', 'Virgin Mojito', 'Fresh mint, lime and soda shaken into a lively drink.', 140.00),
    ('Beverages', 'Mango Lassi', 'Creamy mango yogurt drink with a smooth tropical taste.', 170.00),
    ('Beverages', 'Banana Shake', 'Thick banana shake blended rich and mellow.', 120.00),
    ('Beverages', 'Strawberry Shake', 'Sweet strawberry shake with a silky finish.', 130.00),
    ('Beverages', 'Watermelon Juice', 'Fresh watermelon juice served cool and bright.', 110.00),
    ('Beverages', 'Orange Juice', 'Freshly pressed orange juice with a clean citrus lift.', 115.00),
    ('Beverages', 'Pineapple Juice', 'Tropical pineapple juice with a sweet tang.', 105.00),
    ('Beverages', 'Coconut Water', 'Chilled coconut water, light and naturally sweet.', 90.00),
    ('Beverages', 'Soft Drink', 'Ice-cold fizzy drink served crisp and refreshing.', 55.00),
    ('Beverages', 'Sparkling Water', 'Sparkling mineral water with a clean finish.', 80.00),
    ('Beverages', 'Salted Buttermilk', 'Cooling salted buttermilk with roasted spice notes.', 95.00),
    ('Beverages', 'Hot Chocolate', 'Warm chocolate drink, smooth and comforting.', 150.00),
    ('Beverages', 'Green Tea', 'Light green tea brewed fresh and clean.', 40.00),
    ('Beverages', 'Peach Iced Tea', 'Chilled tea with peach aroma and soft sweetness.', 125.00),
    ('Beverages', 'Herbal Infusion', 'A fragrant herbal blend brewed for a calm finish.', 70.00),
    ('Beverages', 'Seasonal Fruit Cooler', 'A rotating fresh fruit cooler served ice cold.', 85.00),

    ('Services', 'Table Reservation', 'Reserve your favorite table with priority handling.', 1000.00),
    ('Services', 'Birthday Setup', 'Celebrate with balloons, cake table styling and warm service.', 1500.00),
    ('Services', 'Private Dining Room', 'A dedicated private room for relaxed premium dining.', 2200.00),
    ('Services', 'Buffet Counter Setup', 'Full buffet arrangement with elegant service flow.', 1800.00),
    ('Services', 'Live Cooking Station', 'Chef-led live station for a fresh guest experience.', 2500.00),
    ('Services', 'Catering Package Small', 'Small event catering with plated service and setup.', 1200.00),
    ('Services', 'Catering Package Medium', 'Medium event catering with coordinated service and delivery.', 1800.00),
    ('Services', 'Catering Package Large', 'Large event catering for weddings, offices and festivals.', 4500.00),
    ('Services', 'Corporate Lunch Delivery', 'Fresh lunch boxes delivered to your office on time.', 1600.00),
    ('Services', 'Family Feast Arrangement', 'A family-style dining arrangement for group celebrations.', 2400.00),
    ('Services', 'Event Dessert Counter', 'A premium dessert counter with display and service.', 1300.00),
    ('Services', 'Tea Service Upgrade', 'Upgrade your tea service with premium presentation.', 1100.00),
    ('Services', 'Extra Spice Tasting', 'A guided spice tasting experience for adventurous guests.', 1400.00),
    ('Services', 'Chef''s Special Platter', 'A custom premium platter curated by the chef for your table.', 2600.00),
    ('Services', 'Combo Platter Upgrade', 'Upgrade your combo to a larger premium spread.', 1700.00),
    ('Services', 'Festival Feast Package', 'High-volume festive dining service for special occasions.', 5000.00),
    ('Services', 'Anniversary Decoration', 'Table and room decoration for anniversary celebrations.', 1200.00),
    ('Services', 'Takeaway Packing Premium', 'Premium takeaway packaging for neat and secure handoff.', 1000.00),
    ('Services', 'Home Delivery Priority', 'Priority dispatch for faster home delivery service.', 1800.00),
    ('Services', 'Late Night Service', 'Extended-hour service with dedicated late-night handling.', 1300.00),
    ('Services', 'Corporate Meeting Service', 'Professional meeting service with tidy presentation.', 2200.00),
    ('Services', 'Kids Party Setup', 'Fun setup and child-friendly service for kids events.', 1600.00),
    ('Services', 'Bridal Shower Setup', 'Elegant bridal shower setup with premium table styling.', 2500.00),
    ('Services', 'VIP Table Service', 'Dedicated VIP attention with polished service and priority care.', 3000.00),
    ('Services', 'Custom Menu Consultation', 'Plan a tailored menu with our kitchen team.', 1900.00),
    ('Services', 'Live Music Arrangement', 'Optional live music arrangement for special dining nights.', 3200.00)
;

update menu_items mi
set
  description = s.description,
  price = s.price_npr,
  price_npr = s.price_npr,
  points_earned = round(s.price_npr * 0.05, 2),
  updated_at = now()
from seed_menu_items s
join menu_categories mc on mc.name = s.category_name
where mi.name = s.name
  and mi.category_id = mc.id;

insert into menu_items (
  category_id,
  name,
  description,
  price,
  price_npr,
  points_earned,
  in_stock,
  available
)
select
  mc.id as category_id,
  s.name,
  s.description,
  s.price_npr as price,
  s.price_npr,
  round(s.price_npr * 0.05, 2) as points_earned,
  true,
  true
from seed_menu_items s
join menu_categories mc on mc.name = s.category_name
where not exists (
  select 1
  from menu_items mi
  where mi.name = s.name
    and mi.category_id = mc.id
);
