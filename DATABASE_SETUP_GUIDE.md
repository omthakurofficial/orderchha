# 🗄️ OrderChha Database Setup Guide - Fresh Installation

## 🎯 Overview
This guide will help you set up a fresh Supabase database with the enhanced international user management system for OrderChha.

## 📋 Prerequisites
- ✅ Supabase project created
- ✅ Old tables deleted from Supabase dashboard
- ✅ OrderChha app running locally on http://localhost:9002

## 🚀 Step-by-Step Database Setup

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query" to create a new SQL script

### Step 2: Run Canonical Core Schema
1. **Copy the entire content** from `sql/01-core-schema.sql`
2. **Paste it** in the Supabase SQL Editor
3. **Click "Run"** to execute the script
4. ✅ **Verify**: Core tables and indexes created

### Step 3: Run Customer/Loyalty + Seed Data
1. **Run** `sql/03-customer-profile-updates.sql`
2. **Run** `sql/04-loyalty-system.sql`
3. **Run** `sql/05-seed-nepali-thai.sql`
4. ✅ **Verify**: Customer, loyalty, and menu seed data inserted without conflicts

### Step 4: Verify Database Structure
In Supabase Table Editor, you should see these tables:
- ✅ `users` (comprehensive with 25+ fields)
- ✅ `menu_categories`
- ✅ `menu_items`
- ✅ `tables`
- ✅ `orders`
- ✅ `order_items`
- ✅ `transactions`
- ✅ `inventory`
- ✅ `settings`

### Step 5: Test Database Connection
1. In your OrderChha app, go to **http://localhost:9002/debug/database**
2. Click "Test Supabase Connection"
3. ✅ **Verify**: Should show "Connection successful" with sample data

### Step 6: Test User Management
1. Go to **http://localhost:9002/users**
2. Click "Add Staff User"
3. ✅ **Test**: Fill out the comprehensive form with:
   - **Country**: Nepal (default)
   - **Mobile**: +977 format
   - **Personal details**: Name, emergency contact, etc.
   - **Education**: Select education level
   - **Bank info**: Add banking details
   - **Documents**: Citizenship number, etc.
4. ✅ **Verify**: User should be created successfully

### Step 7: Test Profile System
1. Click on your avatar in the top navigation
2. Go to **Profile** page
3. ✅ **Verify**: Should show comprehensive profile information
4. Click "Edit Profile"
5. ✅ **Test**: Should open enhanced edit dialog with all sections

## 🔧 Database Configuration Details

### Enhanced Users Table Fields:
```sql
-- Core Identity: id, uid, auth_user_id, name, email, role
-- Contact: mobile, emergency_contact, address
-- Personal: date_of_birth, blood_group, marital_status, religion
-- Location: country (Nepal default), nationality, languages_spoken
-- Work: designation, employee_id, department, salary, joining_date
-- Education: highest_education, institute_name, graduation_year, specialization
-- Banking: bank_name, account_number, routing_number, account_type
-- Documents: national_id, tax_id, passport_number, driving_license
-- Additional: notes, skills, previous_experience, certifications
```

### Security Features:
- ✅ **Row Level Security (RLS)** enabled
- ✅ **User policies**: Users can only access their own data
- ✅ **Admin policies**: Admins can manage all users
- ✅ **Data masking**: Sensitive info protected in display

### Sample Data Included:
- ✅ **Default Admin**: admin@orderchha.cafe (Nepal-based)
- ✅ **Sample Staff**: ramesh@orderchha.cafe (Nepali waiter)
- ✅ **Menu Items**: Pizza, beverages, momos (Nepal-focused)
- ✅ **Tables**: 10 restaurant tables
- ✅ **Settings**: NPR currency, Nepal address

## 🇳🇵 Nepal-Specific Features
- **Default Country**: Nepal
- **Currency**: NPR (Nepali Rupees)
- **Phone Format**: +977 (Nepal country code)
- **Documents**: Citizenship Number, VAT Number
- **Local Items**: Momos, Lassi in menu
- **Address Format**: Kathmandu, Nepal

## 🌍 International Support Ready
- **Multi-Country**: 12 countries supported with flags
- **Flexible Documents**: National ID system adapts to country
- **Banking**: International account types and codes
- **Languages**: Multi-lingual staff support

## ⚡ Quick Verification Checklist
- [ ] Supabase tables created successfully
- [ ] Sample data visible in table editor
- [ ] App connects to database without errors
- [ ] User creation form shows Nepal as default
- [ ] Profile page displays comprehensive information
- [ ] Edit profile dialog has all sections
- [ ] Mobile format shows +977 (Nepal)
- [ ] Currency displays as NPR

## 🆘 Troubleshooting
If you encounter issues:
1. **Check Supabase URL/Key**: Verify in `.env.local`
2. **Network Issues**: Test `/api/test-supabase` endpoint
3. **RLS Issues**: Ensure policies are correctly applied
4. **Data Issues**: Verify sample data was inserted

## 🎉 Success!
Once all steps are complete, you'll have a **comprehensive, international-ready restaurant management database** with **Nepal-focused defaults** and **global marketplace scalability**!

Your OrderChha app is now ready for:
- 🇳🇵 Nepal market deployment
- 🌍 International expansion
- 👥 Professional staff management
- 🔒 Enterprise-level security
- 📈 Marketplace distribution
