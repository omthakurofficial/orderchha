#!/bin/bash

# Test mobile footer by logging in as admin and checking mobile view
echo "🧪 Testing Mobile Footer Navigation"
echo "================================="
echo ""

echo "1. Starting server on port 3000..."
cd /home/om/Documents/orderchha

# Kill any existing processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the server in background
npm run dev -- -p 3000 &
SERVER_PID=$!

# Wait for server to start
echo "2. Waiting for server to start..."
sleep 5

echo "3. Server started! Test these URLs in mobile view:"
echo ""
echo "🔗 Main Dashboard: http://localhost:3000"
echo "🔗 Login Page: http://localhost:3000/login"
echo ""
echo "📱 To test mobile footer:"
echo "   1. Open browser developer tools (F12)"
echo "   2. Toggle device toolbar (Ctrl+Shift+M)"
echo "   3. Select mobile device or set width < 768px"
echo "   4. Login with admin@orderchha.cafe / admin123"
echo "   5. Check if mobile footer appears at bottom"
echo "   6. Try clicking footer navigation items"
echo ""
echo "🛑 Press Ctrl+C to stop the server"

# Wait for user to stop
wait $SERVER_PID
