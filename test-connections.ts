// Test script to verify Appwrite and MongoDB connections
import { Client, Account, Databases } from 'appwrite';
import { MongoClient } from 'mongodb';

// Test Appwrite connection
export async function testAppwrite() {
  try {
    console.log('🧪 Testing Appwrite connection...');
    
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    
    const account = new Account(client);
    
    // This will throw an error if connection fails
    await account.get();
    
    console.log('✅ Appwrite connection successful!');
    return true;
  } catch (error: any) {
    if (error.code === 401) {
      console.log('✅ Appwrite connection successful! (No user logged in - this is expected)');
      return true;
    }
    console.error('❌ Appwrite connection failed:', error.message);
    return false;
  }
}

// Test MongoDB connection
export async function testMongoDB() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    // Test database access
    const db = client.db('orderchha');
    await db.admin().ping();
    
    console.log('✅ MongoDB connection successful!');
    await client.close();
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Run tests
export default async function runTests() {
  console.log('🚀 Testing new stack connections...\n');
  
  const appwriteOk = await testAppwrite();
  const mongoOk = await testMongoDB();
  
  console.log('\n📊 Results:');
  console.log(`Appwrite: ${appwriteOk ? '✅' : '❌'}`);
  console.log(`MongoDB: ${mongoOk ? '✅' : '❌'}`);
  
  if (appwriteOk && mongoOk) {
    console.log('\n🎉 All services connected! Ready to migrate your app.');
  } else {
    console.log('\n⚠️  Some services need configuration. Check your environment variables.');
  }
}
