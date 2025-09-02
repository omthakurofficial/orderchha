-- Add transactions table for billing management
CREATE TABLE transactions (
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

-- Create indexes for performance
CREATE INDEX idx_transactions_table_id ON transactions(table_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_method ON transactions(method);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add sample data
INSERT INTO tables (id, name, location, capacity) VALUES
  (1, 'Table 1', 'Main Hall', 4),
  (2, 'Table 2', 'Main Hall', 6),
  (3, 'Table 3', 'Garden', 4),
  (4, 'Table 4', 'Private Room', 8),
  (5, 'Table 5', 'Terrace', 2)
ON CONFLICT (id) DO NOTHING;
