#!/bin/bash

# 🚀 OrderChha Nepal Edition - Vercel Deployment Script
# Run this to deploy your Nepal-focused international restaurant system

echo "🇳🇵 Deploying OrderChha Nepal Edition to Vercel..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the orderchha project root"
    exit 1
fi

# Ensure everything is committed
echo "📝 Checking git status..."
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "🔄 Committing changes..."
    git add .
    git commit -m "Pre-deployment commit: $(date)"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin master

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deployment."
    exit 1
fi

echo "✅ Build successful!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment Complete!"
echo "========================"
echo ""
echo "🇳🇵 Your Nepal-focused OrderChha system is now live!"
echo ""
echo "📋 Post-Deployment Checklist:"
echo "1. ✅ Test your deployed app URL"
echo "2. ✅ Verify /debug/database page works"
echo "3. ✅ Test /users page with Nepal defaults"
echo "4. ✅ Check /profile page functionality"
echo "5. ✅ Update Supabase Site URL with your Vercel domain"
echo "6. ✅ Update Appwrite Platform with your Vercel domain"
echo ""
echo "🌟 Features Ready:"
echo "- 🇳🇵 Nepal-first with international support"
echo "- 👥 Comprehensive user management (25+ fields)"
echo "- 🏦 Banking & education information"
echo "- 🌍 12 countries supported"
echo "- 🔒 Enterprise-level security"
echo ""
echo "Your marketplace-ready restaurant system is live! 🚀"
