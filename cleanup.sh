#!/bin/bash

# Script to clean up all unnecessary files in the OrderChha project
echo "🧹 Starting comprehensive project cleanup..."

# 1. Remove unused hybrid database files
echo "🗑️ Removing hybrid database related files..."
rm -f src/lib/firebase-bridge.ts 2>/dev/null
rm -f src/lib/multi-database.ts 2>/dev/null
rm -f src/context/app-context-hybrid.tsx 2>/dev/null
rm -f src/app/api/test-firebase/route.ts 2>/dev/null
rm -rf src/app/debug/hybrid-database 2>/dev/null
rm -f HYBRID_DATABASE_TROUBLESHOOTING.md 2>/dev/null
rm -f test-hybrid-database.sh 2>/dev/null

# 2. Remove other unused files
echo "🗑️ Removing other unused files..."
rm -f src/types/database.ts 2>/dev/null

# 3. Remove the old clean-firebase script (this one is more comprehensive)
echo "🗑️ Removing old cleanup script..."
rm -f clean-firebase.sh 2>/dev/null

echo "✅ Cleanup complete! Removed all unnecessary files from the project."
echo "The application now has a cleaner structure using only Supabase."
