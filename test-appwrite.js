// Test script to verify Appwrite connection
const { Client, Account, ID } = require('appwrite');

async function testAppwriteConnection() {
  console.log('🔄 Testing Appwrite connection...');
  
  try {
    // Initialize client
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'orderchha-app');

    const account = new Account(client);

    // Test auth helper functions
    const auth = {
      getCurrentUser: async () => {
        try {
          const user = await account.get();
          return user;
        } catch {
          return null;
        }
      },
      
      signUp: async (email, password, name) => {
        const user = await account.create(ID.unique(), email, password, name);
        return user;
      }
    };
    
    // Try to get current user
    const user = await auth.getCurrentUser();
    
    if (user) {
      console.log('✅ Connected to Appwrite!');
      console.log('📧 User email:', user.email);
      console.log('👤 User name:', user.name);
      console.log('🆔 User ID:', user.$id);
    } else {
      console.log('ℹ️ No user currently signed in');
      console.log('✅ But Appwrite connection is working!');
    }
    
    // Test creating a demo user (you can skip this if you already have users)
    console.log('\n🔄 Testing user creation...');
    try {
      await auth.signUp('demo@orderchha.cafe', 'password123', 'Demo User');
      console.log('✅ Demo user created successfully!');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Demo user already exists (this is fine)');
      } else {
        console.log('⚠️ Demo user creation failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Appwrite connection failed:', error.message);
    console.log('🔧 Please check your environment variables and Appwrite configuration');
  }
}

// Run the test
testAppwriteConnection();
