#!/bin/bash

echo "🔧 Setting up Supabase environment variables for Vercel..."

echo "📝 Adding NEXT_PUBLIC_SUPABASE_URL to all environments..."
echo "https://duzqqpcxatbdcxoevepy.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "https://duzqqpcxatbdcxoevepy.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview  
echo "https://duzqqpcxatbdcxoevepy.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL development

echo "🔑 Adding NEXT_PUBLIC_SUPABASE_ANON_KEY to all environments..."
echo "sb_publishable__HgbtI-Df37sPwYpUp6oKA_BJ6Rm3p-" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "sb_publishable__HgbtI-Df37sPwYpUp6oKA_BJ6Rm3p-" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "sb_publishable__HgbtI-Df37sPwYpUp6oKA_BJ6Rm3p-" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

echo "✅ Environment variables setup complete!"
echo "🚀 Ready to deploy to production!"
