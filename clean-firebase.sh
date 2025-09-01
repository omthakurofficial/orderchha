#!/bin/bash

# Script to remove hybrid database implementation and Firebase references
# Run this script to clean up the codebase and focus on Supabase only

echo "🔄 Starting cleanup of hybrid database implementation..."

# 1. Remove Firebase bridge files
echo "🗑️ Removing Firebase bridge files..."
rm -f src/lib/firebase-bridge.ts
rm -f src/lib/multi-database.ts

# 2. Remove hybrid context file
echo "🗑️ Removing hybrid database context..."
rm -f src/context/app-context-hybrid.tsx

# 3. Remove Firebase test API
echo "🗑️ Removing Firebase test API..."
rm -f src/app/api/test-firebase/route.ts

# 4. Remove hybrid database debug page
echo "🗑️ Removing hybrid database debug page..."
rm -f src/app/debug/hybrid-database/page.tsx

# 5. Remove Firebase documentation
echo "🗑️ Removing Firebase documentation..."
rm -f FIREBASE_TROUBLESHOOTING.md
rm -f HYBRID_ARCHITECTURE.md

echo "✅ Cleanup complete!"
echo "The application now uses only Supabase for database operations."
echo "You can access the database debug page at /debug/database"
