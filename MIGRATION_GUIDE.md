# Migration Guide: Firebase → Appwrite + MongoDB + Vercel

## Overview
This guide will help you migrate from Firebase to a completely FREE stack while maintaining all current functionality.

## 🚀 New Stack Architecture (100% Free!)
- **Frontend**: Vercel (already working ✅)
- **Authentication**: Appwrite (15 months free access ✅)
- **Database**: MongoDB Atlas ($50 credit + permanent M0 free tier ✅)
- **Storage**: Appwrite Storage (2GB free)
- **Real-time**: Appwrite Realtime subscriptions
- **Functions**: Appwrite Functions (750K executions/month free)

## Why This Stack is Perfect for You:
- **Appwrite Free Tier**: 75K users, 2GB storage, 750K function executions
- **MongoDB Free Tier**: 512MB storage (perfect for restaurant data)
- **No billing required anywhere** (Firebase needs billing for functions)
- **Better features**: Appwrite has built-in auth, real-time, file storage
- **Your $50 MongoDB credit**: Can upgrade to bigger cluster later if needed

## Phase 1: Setup New Services

### 1. Setup Appwrite (Your 15-month Access)
1. Go to [Appwrite Cloud](https://cloud.appwrite.io)
2. Login with your account
3. Create new project: "orderchha-app"
4. Get your Project ID and API Endpoint from Settings

### 2. Setup MongoDB Atlas ($50 Credit)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Login with your account  
3. Create new cluster (M0 Free tier - permanent free!)
4. Create database user and whitelist 0.0.0.0/0 (all IPs)
5. Get connection string

### 3. Install New Dependencies
```bash
# Remove Firebase
npm uninstall firebase

# Install new stack
npm install appwrite mongodb @types/mongodb
```

## Phase 2: Create New Configuration Files

### 1. Create Appwrite Client
Create `src/lib/appwrite.ts`:
```typescript
import { Client, Account, Databases, Storage, Functions } from 'appwrite';

const client = new Client();

const appwriteUrl = process.env.NEXT_PUBLIC_APPWRITE_URL!;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

client
    .setEndpoint(appwriteUrl)
    .setProject(appwriteProjectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export { client };
```

### 2. Keep MongoDB Client (Same as before)
Keep `src/lib/mongodb.ts` as created.

### 3. Update Environment Variables
Update your `.env.local`:
```bash
# Appwrite (Replace Firebase config)
NEXT_PUBLIC_APPWRITE_URL=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

# MongoDB (Your $50 credit)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/orderchha?retryWrites=true&w=majority

# Remove Firebase config
# NEXT_PUBLIC_FIREBASE_CONFIG=...
```

## Phase 3: Migration Steps

### Step 1: Replace Firebase Auth with Appwrite Auth
- Replace `getAuth()` with `account` from Appwrite
- Replace `signInWithEmailAndPassword` with `account.createEmailSession`
- Replace `onAuthStateChanged` with `account.get()` and sessions

### Step 2: Replace Firestore with MongoDB
- Replace Firebase collections with MongoDB collections
- Replace `onSnapshot` with MongoDB change streams or Appwrite real-time
- Replace `doc()`, `getDoc()`, `setDoc()` with MongoDB operations

### Step 3: Replace Firebase Storage with Appwrite Storage
- Replace Firebase Storage with Appwrite Storage (2GB free)
- Replace `uploadBytes` with `storage.createFile`

### Step 4: Update Real-time Features
- Replace Firebase onSnapshot with Appwrite real-time subscriptions
- MongoDB change streams for complex data updates

### Step 5: Update GitHub Actions for Vercel (Keep Current)
- Keep your working Vercel deployment
- Just update environment variables

### Step 6: Test and Deploy

## Benefits of New Stack
- ✅ **100% FREE** for your usage level (no billing anywhere!)
- ✅ **Better performance** (MongoDB for complex queries)
- ✅ **More features** (Appwrite has auth + db + storage + functions)
- ✅ **15 months guaranteed** (Your Appwrite access)
- ✅ **$50 MongoDB credit** (can upgrade cluster if needed)
- ✅ **Real-time updates** (Appwrite real-time subscriptions)
- ✅ **File storage** (2GB in Appwrite vs Firebase Storage billing)

## Migration Timeline
- **Phase 1**: Setup services (30 minutes)
- **Phase 2**: Configuration (30 minutes)  
- **Phase 3**: Code migration (2-3 hours)
- **Phase 4**: Testing (1 hour)
- **Phase 5**: Deployment (30 minutes)

**Total estimated time: 4-5 hours**
