const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixSettings() {
  console.log('🔧 FIXING SYSTEM SETTINGS');
  console.log('=========================\n');
  
  // First, clear corrupted settings
  console.log('🗑️ Clearing corrupted settings...');
  const { error: deleteError } = await supabase.from('settings').delete().neq('id', 'impossible-id');
  
  if (deleteError) {
    console.log('❌ Error clearing settings:', deleteError.message);
  } else {
    console.log('✅ Corrupted settings cleared');
  }
  
  // Create proper settings
  console.log('\n📝 Creating default settings...');
  const defaultSettings = [
    { key: 'restaurant_name', value: 'Sips & Slices Corner' },
    { key: 'vat_rate', value: '13' },
    { key: 'service_charge', value: '0' },
    { key: 'currency', value: 'NPR' },
    { key: 'address', value: '123 Gourmet Street, Foodie City, 98765' },
    { key: 'phone', value: '(555) 123-4567' }
  ];
  
  for (const setting of defaultSettings) {
    const { error } = await supabase.from('settings').insert(setting);
    if (error) {
      console.log(`❌ Error creating setting ${setting.key}:`, error.message);
    } else {
      console.log(`✅ Created: ${setting.key} = ${setting.value}`);
    }
  }
  
  // Verify settings
  console.log('\n🔍 Verifying settings...');
  const { data: verifySettings } = await supabase.from('settings').select('*');
  
  if (verifySettings && verifySettings.length > 0) {
    console.log('✅ Settings verified:');
    verifySettings.forEach(setting => {
      console.log(`   ${setting.key}: ${setting.value}`);
    });
  } else {
    console.log('❌ Settings verification failed');
  }
}

fixSettings().catch(console.error);
