# Firebase Token Troubleshooting

If you're getting authentication errors with Firebase deployment, follow these steps:

## Method 1: Regenerate Firebase Token

1. **Install Firebase CLI locally** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Generate a new token**:
   ```bash
   firebase login:ci
   ```
   This will give you a new token that you can use in GitHub secrets.

4. **Update GitHub Secret**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions  
   - Update the `FIREBASE_TOKEN` secret with the new token

## Method 2: Use Service Account (Recommended)

Instead of using a CI token, you can use a service account which is more secure:

1. **Create a Service Account**:
   - Go to Google Cloud Console
   - Navigate to IAM & Admin → Service Accounts
   - Create a new service account
   - Assign these roles:
     - Firebase Hosting Admin
     - Cloud Functions Developer
     - Service Account User

2. **Download the Service Account Key**:
   - Click on the service account
   - Go to Keys tab
   - Create a new JSON key
   - Download the JSON file

3. **Add to GitHub Secrets**:
   - Create a new secret called `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Paste the entire JSON content as the secret value

4. **Update Workflow**:
   - Use `GOOGLE_APPLICATION_CREDENTIALS` instead of `--token`

## Current Issues to Check

1. **Firebase Project ID**: Make sure `FIREBASE_PROJECT_ID` secret matches your project ID
2. **Token Permissions**: The token needs hosting and functions permissions
3. **Project Setup**: Ensure Cloud Functions API is enabled (which you've done)

## Quick Test

Test your token locally:
```bash
npx firebase-tools@13.0.2 projects:list --token "YOUR_TOKEN_HERE"
```

If this fails, regenerate the token using Method 1 above.
