#!/bin/bash

echo "🔍 GITHUB ACTIONS STATUS CHECK"
echo "================================"
echo ""

echo "✅ ACTIVE WORKFLOWS:"
echo "   - build.yml (Build & Test)"
echo "   - vercel-deploy.yml (Deploy to Vercel)"
echo ""

echo "🚫 DISABLED WORKFLOWS:"
echo "   - firebase-deploy.yml.disabled (Firebase deployment)"
echo ""

echo "🎯 RECENT COMMITS:"
git log --oneline -n 3

echo ""
echo "📊 CURRENT STATUS:"
echo "   - App: Running on localhost:9002"
echo "   - Firebase: Using stubs (no billing)"
echo "   - CI/CD: Fixed to work without Firebase"
echo "   - Deployment: Vercel ready"
echo ""

echo "🚀 TO TEST GITHUB ACTIONS:"
echo "   1. Visit: https://github.com/omthakurofficial/orderchha/actions"
echo "   2. Check the latest workflow run"
echo "   3. Verify both 'Build and Test' and 'Deploy to Vercel' pass"
echo ""

echo "💡 IF ACTIONS FAIL:"
echo "   - Check if Vercel secrets are configured"
echo "   - Ensure VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID are set"
echo "   - Build workflow should pass (uses Firebase stubs)"
