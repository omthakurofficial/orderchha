# 🚀 OrderChha: Supabase Setup Guide

## Overview
This guide will help you migrate from static data to real-time Supabase database for persistent data across sessions.

## Services Used
✅ **Supabase** (Database + Auth + Real-time)  
✅ **Vercel** (Hosting) - Keep existing setup  

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**  
3. **Sign in with GitHub**
4. **Create New Project:**
   - Name: `orderchha-db`
   - Database Password: `[Generate strong password]`
   - Region: `Southeast Asia (Singapore)` (closest to Nepal)

## Step 2: Set Up Database Schema

1. **Go to SQL Editor in Supabase Dashboard**
2. **Run:** `/home/om/Documents/orderchha/sql/01-core-schema.sql`
3. **Then run:** `/home/om/Documents/orderchha/sql/02-seed-demo-data.sql`
4. **Click "RUN" for each script**

This will create:
- ✅ Menu categories and items with your real data
- ✅ Restaurant tables (Ground Floor, First Floor, Outdoor)  
- ✅ Orders and order items
- ✅ Inventory management
- ✅ Settings configuration
- ✅ Real-time subscriptions enabled

## Step 3: Get Supabase Credentials

1. **Go to Settings → API in Supabase Dashboard**
2. **Copy these values:**
   - Project URL: `https://[project-id].supabase.co`
   - Anon Public Key: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

## Step 4: Update Environment Variables

Add to your `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase handles authentication and data access
```

## Step 5: Update Vercel Environment Variables

1. **Go to Vercel Dashboard → orderchha project**
2. **Settings → Environment Variables**
3. **Add the new Supabase variables for Production**

## Step 6: Switch to Supabase Context

Replace the import in `/home/om/Documents/orderchha/src/app/layout.tsx`:

```tsx
// Change from:
import { AppProvider } from '@/context/app-context';

// Change to:
import { AppProvider } from '@/context/app-context-supabase';
```

## Step 7: Deploy and Test

```bash
npx vercel --prod
```

## What You Get with Supabase:

### ✅ **Real-time Features:**
- 🔄 **Live table status updates** across all devices
- 🔄 **Kitchen orders sync** in real-time  
- 🔄 **Menu changes** reflect immediately
- 🔄 **Inventory updates** sync across staff

### ✅ **Persistent Data:**
- 💾 **Orders survive page refresh**
- 💾 **Table statuses maintained**
- 💾 **Menu customizations saved**
- 💾 **Inventory tracking persistent**

### ✅ **Performance Benefits:**
- ⚡ **Faster than MongoDB** (no SSL issues)
- ⚡ **Built-in caching**
- ⚡ **Auto-scaling**
- ⚡ **CDN optimized**

## Why This Stack is Perfect:

1. **Supabase (Auth + Data)** ➜ User management, login/logout, menu, orders, tables, real-time updates
2. **Vercel (Host)** ➜ Fast deployment, edge functions

## Verification Steps:

After deployment, test:
1. ✅ **Menu loads** with real NPR pricing
2. ✅ **Add item to order** → check if persists on refresh  
3. ✅ **Change table status** → verify updates in real-time
4. ✅ **Kitchen orders** → place order and see in kitchen view
5. ✅ **Inventory management** → add/update items

## Migration Benefits:

**Before (Static):** Data resets on page refresh  
**After (Supabase):** All data persists, real-time updates, multi-device sync

## Troubleshooting:

**If connection fails:**
- Check environment variables are set correctly
- Verify Supabase project is active
- Check network connectivity to Supabase

**If real-time doesn't work:**
- Enable real-time in Supabase dashboard
- Check browser console for websocket errors

Ready to proceed? Let me know if you want me to help with any of these steps!
