#!/bin/bash

# Deployment script for orderchha
# Usage: ./deploy.sh [vercel|firebase]

# Ensure we have the right environment
if [ ! -f .env.local ]; then
  echo "Error: .env.local file not found!"
  echo "Please create .env.local with your Firebase config before deploying."
  exit 1
fi

# Default to Vercel deployment
DEPLOY_TARGET=${1:-vercel}

echo "Building orderchha..."
npm run build

if [ "$DEPLOY_TARGET" = "firebase" ]; then
  echo "Preparing for Firebase deployment..."
  
  # Create static export
  npx next export -o out
  
  # Deploy to Firebase
  echo "Deploying to Firebase..."
  npx firebase deploy --only hosting
  
  echo "Firebase deployment complete!"
elif [ "$DEPLOY_TARGET" = "vercel" ]; then
  echo "Deploying to Vercel..."
  
  # Check if Vercel CLI is installed
  if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
  fi
  
  # Deploy to Vercel
  vercel --prod
  
  echo "Vercel deployment complete!"
else
  echo "Unknown deployment target: $DEPLOY_TARGET"
  echo "Usage: ./deploy.sh [vercel|firebase]"
  exit 1
fi
