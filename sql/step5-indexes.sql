-- STEP 5: Create Indexes for Performance (Optional but recommended)
-- Run this after all previous steps are successful

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_tables_status ON tables(status);
