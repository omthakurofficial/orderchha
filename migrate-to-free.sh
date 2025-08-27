#!/bin/bash

echo "🚀 Starting migration from Firebase to Appwrite + MongoDB..."
echo ""

# Step 1: Install new dependencies
echo "📦 Installing Appwrite and MongoDB..."
npm uninstall firebase
npm install appwrite mongodb @types/mongodb

echo ""
echo "✅ Dependencies installed!"
echo ""

# Step 2: Create environment template
echo "📝 Creating environment template..."
cat > .env.template << EOL
# Appwrite Configuration (Your 15-month access)
NEXT_PUBLIC_APPWRITE_URL=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

# MongoDB Configuration (Your \$50 credit + free tier)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/orderchha?retryWrites=true&w=majority

# Remove these Firebase variables:
# NEXT_PUBLIC_FIREBASE_CONFIG=...
EOL

echo ""
echo "🔧 Next steps to complete migration:"
echo ""
echo "1. Setup Appwrite project:"
echo "   - Go to https://cloud.appwrite.io"
echo "   - Create new project 'orderchha-app'"
echo "   - Copy Project ID to .env.local"
echo ""
echo "2. Setup MongoDB Atlas:"
echo "   - Go to https://cloud.mongodb.com"
echo "   - Create M0 cluster (free)"
echo "   - Get connection string"
echo "   - Add to .env.local"
echo ""
echo "3. Update .env.local with your values from .env.template"
echo ""
echo "4. Run: npm run dev"
echo ""
echo "🎯 Benefits of this migration:"
echo "   ✅ 100% FREE (no billing required anywhere)"
echo "   ✅ Appwrite: 75K users, 2GB storage, 750K functions"
echo "   ✅ MongoDB: 512MB free + your \$50 credit"
echo "   ✅ Vercel: Keep your working deployment"
echo ""
