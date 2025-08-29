#!/bin/bash

# Set environment variables for Vercel production deployment
echo "Setting Vercel environment variables for production..."

echo "Setting NEXT_PUBLIC_APPWRITE_URL..."
echo "https://cloud.appwrite.io/v1" | npx vercel env add NEXT_PUBLIC_APPWRITE_URL production

echo "Setting NEXT_PUBLIC_APPWRITE_PROJECT_ID..."
echo "orderchha-app" | npx vercel env add NEXT_PUBLIC_APPWRITE_PROJECT_ID production

echo "Setting MONGODB_URI..."
echo "mongodb+srv://omthakurcloudengineer:POqBpMotyOmoFtzg@orderchha-cluster.hwbuc8f.mongodb.net/?retryWrites=true&w=majority&appName=orderchha-cluster" | npx vercel env add MONGODB_URI production

echo "All environment variables set! Deploying to production..."
npx vercel --prod
