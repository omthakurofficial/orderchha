-- STEP 3: Create Tables, Orders, and Other Core Tables
-- Run this after Step 2 is successful

-- Restaurant Tables
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INTEGER REFERENCES tables(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name VARCHAR(100),
  phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings
CREATE TABLE settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'app-settings',
  cafe_name VARCHAR(200) DEFAULT 'OrderChha Restaurant',
  address TEXT,
  phone VARCHAR(20),
  logo TEXT,
  currency VARCHAR(10) DEFAULT 'NPR',
  tax_rate DECIMAL(4,2) DEFAULT 0.13,
  service_charge DECIMAL(4,2) DEFAULT 0.10,
  receipt_note TEXT,
  ai_suggestions_enabled BOOLEAN DEFAULT true,
  online_ordering_enabled BOOLEAN DEFAULT true,
  payment_qr_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
