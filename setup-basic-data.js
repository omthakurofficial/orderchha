#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://tdkekdngxwfvfzfxcntp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRka2VrZG5neHdmdmZ6ZnhjbnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3Mjg1MTMsImV4cCI6MjA0ODMwNDUxM30.zBKCEJ2D7GluvBwHGNmQZVYZCEjlCrYJhFkPFyoHaU0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBasicData() {
  console.log('🧪 SETTING UP BASIC DATA');
  console.log('========================\n');

  try {
    // Create menu categories first
    const categories = [
      { id: 'pizza', name: 'Pizza', icon: '🍕', description: 'Freshly made pizzas' },
      { id: 'bbq', name: 'BBQ', icon: '🍖', description: 'Grilled specialties' }
    ];

    console.log('📂 Creating menu categories...');
    for (const category of categories) {
      const { error } = await supabase
        .from('menu_categories')
        .upsert(category);
      
      if (!error) {
        console.log(`✅ Category: ${category.name}`);
      }
    }

    // Create menu items
    const menuItems = [
      {
        id: 'chicken-bbq',
        name: 'Chicken BBQ',
        description: 'Grilled chicken with BBQ sauce',
        price: 600,
        category_id: 'bbq',
        image_url: 'https://example.com/chicken-bbq.jpg',
        in_stock: true
      },
      {
        id: 'margherita-classic',
        name: 'Margherita Classic',
        description: 'Classic pizza with tomato and mozzarella',
        price: 450,
        category_id: 'pizza',
        image_url: 'https://example.com/margherita.jpg',
        in_stock: true
      }
    ];

    console.log('\n🍽️ Creating menu items...');
    for (const item of menuItems) {
      const { error } = await supabase
        .from('menu_items')
        .upsert(item);
      
      if (!error) {
        console.log(`✅ Item: ${item.name} - NPR ${item.price}`);
      }
    }

    // Create tables
    const tables = [
      { id: 1, name: 'Table 1', status: 'available', capacity: 4, notes: 'Window side' },
      { id: 2, name: 'Table 2', status: 'available', capacity: 2, notes: 'Corner table' },
      { id: 3, name: 'Table 3', status: 'available', capacity: 6, notes: 'Large family table' },
    ];

    console.log('\n🪑 Creating tables...');
    for (const table of tables) {
      const { error } = await supabase
        .from('tables')
        .upsert(table);
      
      if (!error) {
        console.log(`✅ ${table.name} (${table.capacity} seats)`);
      }
    }

    console.log('\n🎉 Basic data setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupBasicData();
