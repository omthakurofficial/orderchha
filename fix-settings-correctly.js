const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixSettingsCorrectly() {
  console.log('🔧 FIXING SETTINGS CORRECTLY');
  console.log('============================\n');
  
  // Check current settings
  const { data: currentSettings } = await supabase.from('settings').select('*');
  console.log('📊 Current settings:', currentSettings);
  
  if (!currentSettings || currentSettings.length === 0) {
    console.log('📝 Creating default settings record...');
    
    const { error } = await supabase.from('settings').insert({
      id: 'app-settings',
      cafe_name: 'Sips & Slices Corner',
      address: '123 Gourmet Street, Foodie City, 98765',
      phone: '(555) 123-4567',
      currency: 'NPR',
      tax_rate: 0.13,
      service_charge: 0.00,
      receipt_note: 'Thank you for dining with us!\nPlease come again soon.',
      ai_suggestions_enabled: true,
      online_ordering_enabled: true
    });
    
    if (error) {
      console.log('❌ Error creating settings:', error.message);
    } else {
      console.log('✅ Settings created successfully');
    }
  } else {
    console.log('🔄 Updating existing settings...');
    
    const { error } = await supabase.from('settings').update({
      cafe_name: 'Sips & Slices Corner',
      address: '123 Gourmet Street, Foodie City, 98765',
      phone: '(555) 123-4567',
      currency: 'NPR',
      tax_rate: 0.13,
      service_charge: 0.00,
      receipt_note: 'Thank you for dining with us!\nPlease come again soon.'
    }).eq('id', 'app-settings');
    
    if (error) {
      console.log('❌ Error updating settings:', error.message);
    } else {
      console.log('✅ Settings updated successfully');
    }
  }
  
  // Verify the fix
  console.log('\n🔍 Final verification...');
  const { data: finalSettings } = await supabase.from('settings').select('*');
  
  if (finalSettings && finalSettings.length > 0) {
    const settings = finalSettings[0];
    console.log('✅ Settings verified:');
    console.log(`   Restaurant: ${settings.cafe_name}`);
    console.log(`   Currency: ${settings.currency}`);
    console.log(`   VAT Rate: ${settings.tax_rate * 100}%`);
    console.log(`   Service Charge: ${settings.service_charge * 100}%`);
  }
}

fixSettingsCorrectly().catch(console.error);
