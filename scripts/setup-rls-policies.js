// Setup Row Level Security (RLS) policies for public access
// This allows the anon key to read data from essential tables

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1enFxcGN4YXRiZGN4b2V2ZXB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2NTA2MSwiZXhwIjoyMDcxOTQxMDYxfQ.2LJGhY0iMAcSNdR7_n6qpGCbxnwW-hAG2nVJqNQBvYQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRLSPolicies() {
  console.log('🔧 Setting up RLS policies for public access...');

  try {
    // Allow public read access to menu_categories
    await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on menu_categories
        ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for public read access to menu_categories
        DROP POLICY IF EXISTS "Public read access for menu_categories" ON public.menu_categories;
        CREATE POLICY "Public read access for menu_categories"
        ON public.menu_categories
        FOR SELECT
        TO PUBLIC
        USING (true);
      `
    });

    // Allow public read access to menu_items
    await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on menu_items
        ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for public read access to menu_items
        DROP POLICY IF EXISTS "Public read access for menu_items" ON public.menu_items;
        CREATE POLICY "Public read access for menu_items"
        ON public.menu_items
        FOR SELECT
        TO PUBLIC
        USING (true);
      `
    });

    // Allow public read access to tables
    await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on tables
        ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for public read access to tables
        DROP POLICY IF EXISTS "Public read access for tables" ON public.tables;
        CREATE POLICY "Public read access for tables"
        ON public.tables
        FOR SELECT
        TO PUBLIC
        USING (true);
        
        -- Create policy for public update access to tables (for status updates)
        DROP POLICY IF EXISTS "Public update access for tables" ON public.tables;
        CREATE POLICY "Public update access for tables"
        ON public.tables
        FOR UPDATE
        TO PUBLIC
        USING (true)
        WITH CHECK (true);
      `
    });

    // Allow public access to settings
    await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on settings
        ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for public read access to settings
        DROP POLICY IF EXISTS "Public read access for settings" ON public.settings;
        CREATE POLICY "Public read access for settings"
        ON public.settings
        FOR SELECT
        TO PUBLIC
        USING (true);
      `
    });

    // Allow public access to orders (needed for kitchen)
    await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on orders
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for public access to orders
        DROP POLICY IF EXISTS "Public access for orders" ON public.orders;
        CREATE POLICY "Public access for orders"
        ON public.orders
        FOR ALL
        TO PUBLIC
        USING (true)
        WITH CHECK (true);
      `
    });

    // Allow public access to order_items
    await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on order_items
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for public access to order_items
        DROP POLICY IF EXISTS "Public access for order_items" ON public.order_items;
        CREATE POLICY "Public access for order_items"
        ON public.order_items
        FOR ALL
        TO PUBLIC
        USING (true)
        WITH CHECK (true);
      `
    });

    console.log('✅ RLS policies setup completed!');
    console.log('✅ All tables now have public read access');
    console.log('✅ Tables and orders have public update/insert access');
    console.log('🔒 RLS is enabled but with permissive policies for restaurant operations');

  } catch (error) {
    console.error('❌ Error setting up RLS policies:', error.message);
    process.exit(1);
  }
}

setupRLSPolicies();
