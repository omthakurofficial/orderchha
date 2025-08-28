# 🚀 Vercel Deployment Fix Guide

## 📋 Issues Identified:
1. ❌ Environment variables not set in Vercel
2. ❌ Project not properly linked to Vercel
3. ❌ Session handling issues in production
4. ❌ CORS/authentication issues

## ✅ Step-by-Step Fix:

### 1. Set Environment Variables in Vercel

Go to your Vercel dashboard → Project Settings → Environment Variables and add:

```bash
NEXT_PUBLIC_APPWRITE_URL=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=orderchha-app
MONGODB_URI=mongodb+srv://omthakurcloudengineer:POqBpMotyOmoFtzg@orderchha-cluster.hwb
```

**Important**: Make sure to set these for ALL environments (Production, Preview, Development)

### 2. Update Appwrite Project Settings

In your Appwrite dashboard (https://cloud.appwrite.io):

1. Go to your project "orderchha-app"
2. Navigate to Settings → Platforms
3. Add your Vercel domain as a Web Platform:
   - Name: `Vercel Production`
   - Hostname: `your-app-name.vercel.app` (replace with your actual Vercel URL)
   - Check "Mark as trusted"

### 3. Link Project to Vercel

```bash
cd /home/om/Documents/orderchha
npx vercel link
# Follow prompts to link to existing project
```

### 4. Test Deployment

```bash
# Deploy with environment variables
npx vercel --prod
```

### 5. Debug Production Issues

If issues persist, check:

1. **Browser Console**: Look for CORS errors or missing env vars
2. **Vercel Function Logs**: Check for server-side errors
3. **Network Tab**: Check if API calls to Appwrite are failing

## 🔧 Quick Test Commands:

```bash
# Test environment variables locally
npm run build
npm start

# Test on Vercel
npx vercel dev
```

## 🆘 If Still Not Working:

Add this debugging code to your production app:

```javascript
console.log('Production Debug:', {
  appwriteUrl: process.env.NEXT_PUBLIC_APPWRITE_URL,
  appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  nodeEnv: process.env.NODE_ENV
});
```

## 📞 Common Issues & Solutions:

### Issue: "Can't reach this site"
- **Solution**: Check if Vercel deployment succeeded
- **Check**: Vercel dashboard for deployment status

### Issue: Sign in/out not working on Vercel
- **Solution**: Ensure Appwrite platform settings include your Vercel domain
- **Check**: Appwrite console → Settings → Platforms

### Issue: Environment variables undefined
- **Solution**: Set env vars in Vercel dashboard and redeploy
- **Check**: Vercel dashboard → Settings → Environment Variables

## ⚡ Quick Fix Commands:

```bash
# Re-link and deploy
npx vercel link
npx vercel env add NEXT_PUBLIC_APPWRITE_URL
npx vercel env add NEXT_PUBLIC_APPWRITE_PROJECT_ID
npx vercel --prod
```
