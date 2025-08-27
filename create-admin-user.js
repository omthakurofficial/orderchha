// Script to create admin user in Appwrite
const { Client, Account, ID } = require('appwrite');

async function createAdminUser() {
  console.log('🔄 Creating admin user in Appwrite...');
  
  try {
    // Initialize client
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'orderchha-app');

    const account = new Account(client);
    
    // Create admin user
    const adminEmail = 'admin@orderchha.cafe';
    const adminPassword = 'admin123';
    const adminName = 'Admin';
    
    try {
      const user = await account.create(ID.unique(), adminEmail, adminPassword, adminName);
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('👤 Name:', adminName);
      console.log('🆔 User ID:', user.$id);
      
      console.log('\n🎯 You can now login with:');
      console.log('Email: admin@orderchha.cafe');
      console.log('Password: admin123');
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Admin user already exists');
        console.log('📧 Email: admin@orderchha.cafe');
        console.log('🔑 Password: admin123');
      } else {
        console.error('❌ Error creating admin user:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Appwrite connection failed:', error.message);
  }
}

// Run the script
createAdminUser();
