#!/bin/bash

echo "🚀 Vercel Deployment Fix Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from your project root directory"
    exit 1
fi

echo "📋 Step 1: Checking current setup..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "🔄 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

echo "📋 Step 2: Linking to Vercel (if needed)..."
vercel link

echo "📋 Step 3: Setting environment variables..."

# Set environment variables in Vercel
echo "Setting NEXT_PUBLIC_APPWRITE_URL..."
echo "https://cloud.appwrite.io/v1" | vercel env add NEXT_PUBLIC_APPWRITE_URL production

echo "Setting NEXT_PUBLIC_APPWRITE_PROJECT_ID..."
echo "orderchha-app" | vercel env add NEXT_PUBLIC_APPWRITE_PROJECT_ID production

echo "Setting MongoDB URI..."
if [ -f ".env.local" ]; then
    MONGODB_URI=$(grep MONGODB_URI .env.local | cut -d '=' -f2)
    echo "$MONGODB_URI" | vercel env add MONGODB_URI production
fi

echo "📋 Step 4: Deploying to production..."
vercel --prod

echo "✅ Deployment script completed!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to your Appwrite dashboard: https://cloud.appwrite.io"
echo "2. Navigate to your project → Settings → Platforms"
echo "3. Add your Vercel domain as a Web Platform"
echo "4. Test your deployed app"
echo ""
echo "🆘 If issues persist:"
echo "- Check Vercel function logs"
echo "- Verify environment variables in Vercel dashboard"
echo "- Check browser console for errors"
