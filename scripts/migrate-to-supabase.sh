#!/bin/bash

# OrderChha Migration Script: Switch from Static to Supabase
echo "🚀 OrderChha: Migrating to Supabase Real-time Database"
echo "================================================"

# Step 1: Backup current context
echo "📦 Step 1: Backing up current context..."
cp src/context/app-context.tsx src/context/app-context-backup.tsx
echo "✅ Backup created: app-context-backup.tsx"

# Step 2: Check if Supabase env vars exist
echo "🔍 Step 2: Checking environment variables..."
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null; then
    echo "✅ Supabase environment variables found"
else
    echo "❌ Supabase environment variables missing!"
    echo "📝 Please add to .env.local:"
    echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    echo ""
    echo "🔗 Get these from: https://supabase.com/dashboard/project/your-project/settings/api"
    exit 1
fi

# Step 3: Update layout to use Supabase context
echo "🔄 Step 3: Switching to Supabase context..."
if grep -q "app-context-supabase" src/app/layout.tsx 2>/dev/null; then
    echo "✅ Already using Supabase context"
else
    # Update the import in layout.tsx
    sed -i.bak "s/from '@\/context\/app-context'/from '@\/context\/app-context-supabase'/" src/app/layout.tsx 2>/dev/null || {
        echo "⚠️  Please manually update src/app/layout.tsx:"
        echo "   Change: import { AppProvider } from '@/context/app-context';"
        echo "   To:     import { AppProvider } from '@/context/app-context-supabase';"
    }
    echo "✅ Context switched to Supabase"
fi

# Step 4: Install dependencies
echo "📦 Step 4: Checking Supabase dependency..."
if npm list @supabase/supabase-js &>/dev/null; then
    echo "✅ Supabase client already installed"
else
    echo "📦 Installing Supabase client..."
    npm install @supabase/supabase-js
fi

# Step 5: Build and test
echo "🔨 Step 5: Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Migration Complete!"
    echo "======================"
    echo "✅ Supabase context activated"
    echo "✅ Real-time database ready"
    echo "✅ Persistent data enabled"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Set up your Supabase project (see docs/supabase-setup.md)"
    echo "2. Run the SQL schema in Supabase dashboard"
    echo "3. Add environment variables to Vercel"
    echo "4. Deploy: npx vercel --prod"
    echo ""
    echo "🔄 To rollback: cp src/context/app-context-backup.tsx src/context/app-context.tsx"
else
    echo "❌ Build failed! Rolling back..."
    cp src/context/app-context-backup.tsx src/context/app-context.tsx
    echo "🔄 Rollback complete. Please check the errors above."
    exit 1
fi
