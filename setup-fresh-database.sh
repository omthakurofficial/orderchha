#!/bin/bash

# OrderChha Fresh Database Setup Script
# This script helps you set up the comprehensive database schema

echo "🗄️ OrderChha Database Setup - Fresh Installation"
echo "================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 This script will help you set up a fresh Supabase database${NC}"
echo ""

echo -e "${YELLOW}Step 1: Verify Prerequisites${NC}"
echo "✅ Supabase project created?"
echo "✅ Old tables deleted from Supabase?"
echo "✅ OrderChha app running locally?"
echo ""

read -p "Press Enter to continue once all prerequisites are met..."

echo ""
echo -e "${YELLOW}Step 2: Database Schema Files Ready${NC}"
echo "📁 sql/comprehensive-users-schema.sql - Enhanced user table"
echo "📁 sql/supabase-schema.sql - Complete database schema"
echo ""

echo -e "${GREEN}Next Steps (Manual):${NC}"
echo ""
echo -e "${BLUE}1. Open Supabase Dashboard${NC}"
echo "   → Go to your Supabase project"
echo "   → Click 'SQL Editor' in sidebar"
echo ""

echo -e "${BLUE}2. Run User Schema (First)${NC}"
echo "   → Click 'New Query'"
echo "   → Copy content from: sql/comprehensive-users-schema.sql"
echo "   → Paste and click 'Run'"
echo "   → Should see: 'Success. No rows returned'"
echo ""

echo -e "${BLUE}3. Run Complete Schema (Second)${NC}"
echo "   → Click 'New Query' again"
echo "   → Copy content from: sql/supabase-schema.sql"
echo "   → Paste and click 'Run'"
echo "   → Should create all tables with sample data"
echo ""

echo -e "${BLUE}4. Verify Database${NC}"
echo "   → Check 'Table Editor' tab"
echo "   → Should see: users, menu_categories, menu_items, tables, etc."
echo "   → Check users table has sample Nepal-based staff"
echo ""

echo -e "${BLUE}5. Test Application${NC}"
echo "   → Visit: http://localhost:9002/debug/database"
echo "   → Click 'Test Supabase Connection'"
echo "   → Should show: 'Connection successful'"
echo ""

echo -e "${BLUE}6. Test User Creation${NC}"
echo "   → Visit: http://localhost:9002/users"
echo "   → Click 'Add Staff User'"
echo "   → Test comprehensive form with Nepal defaults"
echo ""

echo -e "${GREEN}🎉 Database Features:${NC}"
echo "🇳🇵 Nepal-focused (default country)"
echo "🌍 International support (12 countries)"
echo "👥 Comprehensive staff management (25+ fields)"
echo "🔒 Security with data masking"
echo "💳 Banking information for payroll"
echo "🎓 Education & certification tracking"
echo "📄 Document management (Citizenship, VAT, Passport)"
echo "💰 NPR currency support"
echo ""

echo -e "${GREEN}📱 Mobile Format: +977 (Nepal)${NC}"
echo -e "${GREEN}💱 Currency: NPR (Nepali Rupees)${NC}"
echo -e "${GREEN}🏢 Sample Location: Thamel, Kathmandu${NC}"
echo ""

echo -e "${YELLOW}⚠️ Important Notes:${NC}"
echo "• Run user schema FIRST, then complete schema"
echo "• Verify each step before proceeding"
echo "• Test connection after database setup"
echo "• Check that Nepal is default country in forms"
echo ""

echo -e "${GREEN}Ready for marketplace distribution! 🚀${NC}"
