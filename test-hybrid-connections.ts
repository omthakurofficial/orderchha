// Test connections for both Appwrite and MongoDB
import { Client, Account, Databases } from 'appwrite';
import { MongoClient } from 'mongodb';

// Test Appwrite connection
async function testAppwrite() {
  console.log('🔥 Testing Appwrite connection...');
  
  try {
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    const account = new Account(client);
    
    try {
      await account.get();
      console.log('✅ Appwrite: Connected and authenticated');
      return true;
    } catch (authError: any) {
      if (authError.code === 401) {
        console.log('✅ Appwrite: Connection successful (no user logged in - this is expected)');
        return true;
      }
      throw authError;
    }
  } catch (error: any) {
    console.error('❌ Appwrite connection failed:', error.message);
    return false;
  }
}

// Test MongoDB connection
async function testMongoDB() {
  console.log('🍃 Testing MongoDB connection...');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    // Test database operations
    const db = client.db('orderchha');
    const collections = await db.listCollections().toArray();
    
    console.log('✅ MongoDB: Connected successfully');
    console.log(`📊 Found ${collections.length} collections in database`);
    
    await client.close();
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Run both tests
async function runConnectionTests() {
  console.log('🚀 Testing Hybrid Stack Connections...\n');
  
  const appwriteOk = await testAppwrite();
  const mongoOk = await testMongoDB();
  
  console.log('\n📋 Results Summary:');
  console.log(`Appwrite Auth/Storage/Functions: ${appwriteOk ? '✅' : '❌'}`);
  console.log(`MongoDB Database: ${mongoOk ? '✅' : '❌'}`);
  
  if (appwriteOk && mongoOk) {
    console.log('\n🎉 HYBRID STACK READY!');
    console.log('📝 You can now start migrating from Firebase to:');
    console.log('   • Appwrite: Authentication, Storage, Functions, Real-time');
    console.log('   • MongoDB: Database operations, Complex queries');
  } else {
    console.log('\n⚠️  Some services need attention. Check your environment variables.');
  }
  
  return { appwriteOk, mongoOk };
}

// For Next.js API route usage
export { testAppwrite, testMongoDB, runConnectionTests };

// For direct Node.js execution
if (require.main === module) {
  runConnectionTests().then(() => process.exit(0));
}
