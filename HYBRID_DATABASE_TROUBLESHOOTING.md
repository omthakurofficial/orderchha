# Hybrid Database Architecture Troubleshooting

This document provides troubleshooting guidance for the hybrid database architecture using Supabase as primary and Firebase as fallback.

## Architecture Overview

The application uses a hybrid database approach:
- **Primary Database**: Supabase (PostgreSQL)
- **Fallback Database**: Firebase (NoSQL)

This design ensures that if the primary database becomes unavailable, the application will automatically switch to the fallback database to maintain service availability.

## Common Issues

### TypeScript Errors with Firebase Bridge

If you encounter TypeScript errors in the Firebase bridge implementation:

1. **Check Firebase SDK Installation**:
   ```bash
   npm install firebase
   ```

2. **Verify Type Definitions**:
   - Ensure `/src/types/database.ts` exists with proper type definitions
   - Check that types are properly exported and imported

3. **Dynamic Imports**:
   - Firebase is dynamically imported to prevent SSR issues
   - Make sure dynamic imports are properly handled with `import()` syntax

### Database Connection Issues

1. **Check Environment Variables**:
   - Supabase URL and API key in `.env.local`
   - Firebase configuration in `.env.local` or `firebase-config.json`

2. **Test API Endpoints**:
   - `/api/test-supabase` should return connection status
   - `/api/test-firebase` should return connection status

3. **Debug Page**:
   - Visit `/debug/hybrid-database` to see detailed connection information
   - Test both databases directly from this page

### Fallback Mechanism Not Working

If the fallback to Firebase is not working properly:

1. **Check Context Provider**:
   - Verify that `app-context-hybrid.tsx` is being used
   - Ensure error handling is properly implemented to detect Supabase failures

2. **Test Firebase Connection**:
   - Use the debug page to test Firebase connection independently
   - Check Firebase console to ensure your project is set up correctly

3. **Verify Data Structure**:
   - Ensure data structures in both databases are compatible
   - Check type definitions for compatibility

## Solutions to Common Errors

### Firebase Import Errors

If you see errors related to Firebase imports:

```typescript
// INCORRECT - can cause SSR issues
import firebase from 'firebase/app';

// CORRECT - use dynamic imports
const getFirebase = async () => {
  const { initializeApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');
  // ...
};
```

### Type Compatibility Issues

Ensure proper type definitions to maintain compatibility:

```typescript
// Example database.ts type definitions
export interface DatabaseInterface {
  getMenu(): Promise<MenuCategory[]>;
  getTables(): Promise<Table[]>;
  // ... other methods
}

// Implement this interface in both database providers
```

### Real-time Subscription Issues

Different real-time subscription patterns for Supabase and Firebase:

```typescript
// Supabase
const subscription = supabase
  .channel('tables')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, callback)
  .subscribe();

// Firebase
const unsubscribe = onSnapshot(collection(db, 'tables'), snapshot => {
  // Handle snapshot
});
```

## Testing the Hybrid Architecture

1. **Test Primary Database**:
   ```bash
   curl http://localhost:3000/api/test-supabase
   ```

2. **Test Fallback Database**:
   ```bash
   curl http://localhost:3000/api/test-firebase
   ```

3. **Test Fallback Mechanism**:
   - Temporarily disable Supabase connection by modifying environment variables
   - Verify application falls back to Firebase

## Debugging Tools

- Use the `/debug/hybrid-database` page to visualize database connections
- Check console logs for connection errors
- Monitor network requests to identify database connection issues

## Contact Support

If you encounter persistent issues with the hybrid database implementation, contact support with:
1. Environment details (Node.js version, npm version)
2. Database connection errors from console
3. Screenshots of the debug page
