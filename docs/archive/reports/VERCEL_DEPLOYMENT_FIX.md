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
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Important**: Make sure to set these for ALL environments (Production, Preview, Development)

### 2. Update Supabase Project Settings

In your Supabase dashboard:

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
3. **Network Tab**: Check if API calls to Supabase are failing

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
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  nodeEnv: process.env.NODE_ENV
});
```

## 📞 Common Issues & Solutions:

### Issue: "Can't reach this site"
- **Solution**: Check if Vercel deployment succeeded
- **Check**: Vercel dashboard for deployment status

### Issue: Sign in/out not working on Vercel
- **Solution**: Ensure Supabase auth settings include your Vercel domain
- **Check**: Supabase console → Authentication → URL Configuration

### Issue: Environment variables undefined
- **Solution**: Set env vars in Vercel dashboard and redeploy
- **Check**: Vercel dashboard → Settings → Environment Variables

## ⚡ Quick Fix Commands:

```bash
# Re-link and deploy
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel --prod
```
