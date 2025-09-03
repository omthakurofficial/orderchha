#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://tdkekdngxwfvfzfxcntp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRka2VrZG5neHdmdmZ6ZnhjbnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3Mjg1MTMsImV4cCI6MjA0ODMwNDUxM30.zBKCEJ2D7GluvBwHGNmQZVYZCEjlCrYJhFkPFyoHaU0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 CHECKING DATABASE STRUCTURE');
  console.log('===============================\n');

  try {
    // Check existing tables
    console.log('📋 Checking tables...');
    
    // Check menu_items
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(5);
    
    console.log('Menu items:', menuItems?.length || 'Error:', menuError?.message || 'OK');
    
    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('*')
      .limit(5);
    
    console.log('Tables:', tables?.length || 'Error:', tablesError?.message || 'OK');
    
    // Check orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5);
    
    console.log('Orders:', orders?.length || 'Error:', ordersError?.message || 'OK');

    if (menuItems && menuItems.length > 0) {
      console.log('\n✅ Database has menu items, ready to create test orders!');
      return true;
    } else {
      console.log('\n❌ Database needs setup. Creating basic structure...');
      await createBasicTables();
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    return false;
  }
}

async function createBasicTables() {
  console.log('\n🏗️ Creating basic database structure...');
  
  try {
    // Create menu_categories table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS menu_categories (
          id text PRIMARY KEY,
          name text NOT NULL,
          icon text,
          description text,
          created_at timestamp with time zone DEFAULT now()
        );
      `
    });
    
    // Create menu_items table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS menu_items (
          id text PRIMARY KEY,
          name text NOT NULL,
          description text,
          price decimal(10,2) NOT NULL,
          category_id text REFERENCES menu_categories(id),
          image_url text,
          in_stock boolean DEFAULT true,
          created_at timestamp with time zone DEFAULT now()
        );
      `
    });
    
    // Create tables table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tables (
          id integer PRIMARY KEY,
          name text NOT NULL,
          status text DEFAULT 'available',
          capacity integer DEFAULT 4,
          notes text,
          created_at timestamp with time zone DEFAULT now()
        );
      `
    });
    
    // Create orders table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          table_id integer REFERENCES tables(id),
          status text DEFAULT 'pending',
          total_amount decimal(10,2),
          customer_name text,
          phone text,
          notes text,
          created_at timestamp with time zone DEFAULT now()
        );
      `
    });
    
    // Create order_items table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS order_items (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
          menu_item_id text REFERENCES menu_items(id),
          quantity integer NOT NULL DEFAULT 1,
          price decimal(10,2) NOT NULL,
          created_at timestamp with time zone DEFAULT now()
        );
      `
    });
    
    console.log('✅ Basic tables created');
    
  } catch (error) {
    console.log('❌ Table creation failed:', error.message);
  }
}

checkDatabase();
