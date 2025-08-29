#!/bin/bash

echo "🔄 MongoDB Migration Script"
echo "=========================="
echo ""
echo "This script will:"
echo "1. 🗂️  Create MongoDB collections"
echo "2. 🍽️  Migrate menu data from static to MongoDB"
echo "3. 🪑  Migrate table data to MongoDB"
echo "4. 👥  Set up user management in MongoDB"
echo "5. 📦  Initialize inventory in MongoDB"
echo ""

# Test MongoDB connection
echo "🔍 Testing MongoDB connection..."
node -e "
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://omthakurcloudengineer:POqBpMotyOmoFtzg@orderchha-cluster.hwbuc8f.mongodb.net/?retryWrites=true&w=majority&appName=orderchha-cluster';

async function test() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ MongoDB connection successful');
    await client.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}
test();
"

echo ""
echo "✅ MongoDB is ready! Now run the data migration..."
echo "📝 Next step: npm run migrate-data"
