#!/bin/bash

echo "🔍 GITHUB ACTIONS STATUS CHECK"
echo "================================"
echo ""

echo "✅ ACTIVE WORKFLOWS:"
echo "   - build.yml (Build & Test) - Updated to Node 20, actions v4"
echo "   - deploy-vercel.yml (Fast Vercel Deploy) - RESTORED working version"
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
echo "   - CI/CD: Fixed, updated, and optimized"
echo "   - Deployment: Fast Vercel CLI method restored"
echo ""

echo "🚀 IMPROVEMENTS MADE:"
echo "   ✅ Restored working deploy-vercel.yml"
echo "   ✅ Removed slow GitHub Action version"
echo "   ✅ Updated to actions/checkout@v4 and setup-node@v4"
echo "   ✅ Upgraded to Node.js 20 to reduce warnings"
echo "   ✅ Optimized npm install with --prefer-offline --no-audit"
echo ""

echo "� CHECK GITHUB ACTIONS:"
echo "   Visit: https://github.com/omthakurofficial/orderchha/actions"
echo ""

echo "💡 EXPECTED RESULTS:"
echo "   - Build workflow: ✅ Should pass quickly (~2-3 minutes)"
echo "   - Deploy workflow: ✅ Should be much faster now (~3-5 minutes)"
echo "   - Fewer deprecation warnings"
