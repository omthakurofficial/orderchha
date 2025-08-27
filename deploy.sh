#!/bin/bash

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
npx firebase deploy --only hosting

echo "Deployment complete!"
