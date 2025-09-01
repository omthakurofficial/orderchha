#!/bin/bash
# Script to test hybrid database connections

echo "🔍 Testing Hybrid Database Architecture"
echo "======================================="

# Test Supabase Connection
echo -e "\n📊 Testing Supabase Connection..."
SUPABASE_RESPONSE=$(curl -s http://localhost:3000/api/test-supabase)
SUPABASE_STATUS=$(echo $SUPABASE_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$SUPABASE_STATUS" == "success" ]; then
  echo "✅ Supabase Connection: SUCCESS"
else
  echo "❌ Supabase Connection: FAILED"
  echo "Error details: $SUPABASE_RESPONSE"
fi

# Test Firebase Connection
echo -e "\n🔥 Testing Firebase Connection..."
FIREBASE_RESPONSE=$(curl -s http://localhost:3000/api/test-firebase)
FIREBASE_STATUS=$(echo $FIREBASE_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$FIREBASE_STATUS" == "success" ]; then
  echo "✅ Firebase Connection: SUCCESS"
elif [ "$FIREBASE_STATUS" == "warning" ]; then
  echo "⚠️ Firebase Connection: INITIALIZING"
  echo "Note: Firebase may still be initializing. This is normal on first load."
else
  echo "❌ Firebase Connection: FAILED"
  echo "Error details: $FIREBASE_RESPONSE"
fi

# Check Database Debug Page
echo -e "\n🧪 Database Debug Page"
echo "The debug page is available at: http://localhost:3000/debug/hybrid-database"
echo "Visit this page to see detailed connection information and test the fallback mechanism."

echo -e "\n📋 Summary"
echo "======================================="
if [ "$SUPABASE_STATUS" == "success" ] && [ "$FIREBASE_STATUS" == "success" ]; then
  echo "✅ Hybrid Database Architecture: FULLY OPERATIONAL"
elif [ "$SUPABASE_STATUS" == "success" ] || [ "$FIREBASE_STATUS" == "success" ]; then
  echo "⚠️ Hybrid Database Architecture: PARTIALLY OPERATIONAL"
  echo "At least one database is working, application should function with limited capabilities."
else
  echo "❌ Hybrid Database Architecture: FAILED"
  echo "Neither database is operational. Check configuration and connections."
fi

echo -e "\nFor more information, see HYBRID_DATABASE_TROUBLESHOOTING.md"
