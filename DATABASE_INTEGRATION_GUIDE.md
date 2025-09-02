# DATABASE INTEGRATION GUIDE

## 🎯 IMMEDIATE STEPS TO FIX RECEIPT PRINTING AND DATABASE INTEGRATION

### Step 1: Run SQL Queries in Supabase (MOST IMPORTANT)

1. **Go to your Supabase Dashboard** → SQL Editor
2. **Copy and paste these queries ONE BY ONE:**

```sql
-- QUERY 1: Disable RLS for unrestricted access
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

```sql
-- QUERY 2: Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INTEGER REFERENCES tables(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(20) DEFAULT 'cash' CHECK (method IN ('cash', 'online', 'card')),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  customer_name VARCHAR(100),
  phone VARCHAR(20),
  invoice_number VARCHAR(50) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

```sql
-- QUERY 3: Add test orders for notifications
INSERT INTO orders (id, table_id, total_amount, status, customer_name, phone, notes) VALUES
('11111111-1111-1111-1111-111111111111', 1, 598.00, 'pending', 'John Doe', '+91-9876543210', 'Needs confirmation'),
('22222222-2222-2222-2222-222222222222', 2, 427.00, 'preparing', 'Jane Smith', '+91-9876543211', 'In kitchen'),
('33333333-3333-3333-3333-333333333333', 3, 349.00, 'ready', 'Bob Johnson', '+91-9876543212', 'Ready for billing');

INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
('11111111-1111-1111-1111-111111111111', 'pizza-margherita', 2, 299.00),
('22222222-2222-2222-2222-222222222222', 'pasta-carbonara', 1, 249.00),
('22222222-2222-2222-2222-222222222222', 'samosa', 2, 89.00),
('33333333-3333-3333-3333-333333333333', 'chicken-tikka', 1, 329.00),
('33333333-3333-3333-3333-333333333333', 'masala-chai', 1, 49.00);

UPDATE tables SET status = 'occupied' WHERE id IN (1, 2);
UPDATE tables SET status = 'billing' WHERE id = 3;
```

```sql
-- QUERY 4: Check the results
SELECT 'Confirm Orders Badge' as section, COUNT(*) as count FROM orders WHERE status = 'pending'
UNION ALL
SELECT 'Kitchen Badge', COUNT(*) FROM orders WHERE status IN ('preparing', 'ready')  
UNION ALL
SELECT 'Billing Badge', COUNT(*) FROM orders WHERE status = 'ready'
UNION ALL
SELECT 'Tables Status', COUNT(*) FROM tables WHERE status = 'billing';
```

### Step 2: Refresh App Data

1. **In your app**, go to **Settings** page
2. **Click the "🔄 Refresh Data from Database"** button
3. **You should now see notification badges** in the sidebar

### Step 3: Test the Workflow

1. **Confirm Orders (Badge: 1)**: Go to Confirm Orders → Approve pending order
2. **Kitchen (Badge: 2)**: Go to Kitchen → Mark order as ready  
3. **Billing (Badge: 1)**: Go to Billing → Process payment

### Step 4: Verify Receipt Printing

1. **Go to Billing** page
2. **Process a payment** for Table 3 (should show Bob Johnson's order)
3. **Receipt should now print with real data** from database

---

## 🔧 TROUBLESHOOTING

### If Notification Badges Don't Show:
```sql
-- Check database data
SELECT o.status, COUNT(*) FROM orders o GROUP BY o.status;
SELECT t.status, COUNT(*) FROM tables t GROUP BY t.status;
```

### If Receipt Still Shows Mock Data:
1. **Clear browser cache and localStorage**
2. **Click refresh button in Settings**
3. **Check browser console for errors**

### If Database Connection Fails:
1. **Check Supabase environment variables** in `.env.local`
2. **Verify Supabase project is running**
3. **Check browser console for connection errors**

---

## 📱 WHAT YOU'LL SEE

After running the SQL queries, you should see:
- **Confirm Orders**: Red badge with "1" (pending order)
- **Kitchen**: Orange badge with "2" (preparing + ready orders)  
- **Billing**: Green badge with "1" (ready for billing)

The workflow will be:
1. **Confirm Orders** → Approve → Moves to Kitchen
2. **Kitchen** → Mark Ready → Moves to Billing
3. **Billing** → Process Payment → Saves to transactions table

The receipt will now print with real customer data and order details from the database!
