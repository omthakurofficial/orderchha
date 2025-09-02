// Production-ready Appwrite configuration with better error handling
import { Client, Account, Databases, Storage, Functions, ID, Models } from 'appwrite';

// Environment validation
const appwriteUrl = process.env.NEXT_PUBLIC_APPWRITE_URL;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

console.log('🔧 Appwrite Config Check:', {
  url: appwriteUrl ? '✅ Set' : '❌ Missing',
  projectId: appwriteProjectId ? '✅ Set' : '❌ Missing',
  environment: process.env.NODE_ENV
});

if (!appwriteUrl || !appwriteProjectId) {
  console.error('❌ Missing Appwrite environment variables:', {
    NEXT_PUBLIC_APPWRITE_URL: appwriteUrl || 'MISSING',
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: appwriteProjectId || 'MISSING'
  });
}

// Initialize Appwrite client with error handling
const client = new Client();

try {
  client
    .setEndpoint(appwriteUrl || 'https://cloud.appwrite.io/v1')
    .setProject(appwriteProjectId || 'orderchha-app');
  
  console.log('✅ Appwrite client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Appwrite client:', error);
}

// Export services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Production-safe auth helpers
export const auth = {
  signIn: async (email: string, password: string) => {
    try {
      console.log('🔄 Attempting sign in for:', email);
      
      // Clear any existing sessions first
      try {
        await account.deleteSession('current');
      } catch (e) {
        console.log('ℹ️ No existing session to clear');
      }
      
      const session = await account.createEmailPasswordSession(email, password);
      console.log('✅ Sign in successful');
      return session;
    } catch (error: any) {
      console.error('❌ Sign in failed:', error.message);
      throw new Error(error.message || 'Sign in failed');
    }
  },
  
  signUp: async (email: string, password: string, name: string) => {
    try {
      console.log('🔄 Creating user:', email);
      const user = await account.create(ID.unique(), email, password, name);
      console.log('✅ User created successfully');
      return user;
    } catch (error: any) {
      console.error('❌ Sign up failed:', error.message);
      throw new Error(error.message || 'Sign up failed');
    }
  },
  
  signOut: async () => {
    try {
      console.log('🔄 Signing out...');
      await account.deleteSession('current');
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.log('⚠️ Sign out error, trying to clear all sessions:', error.message);
      try {
        await account.deleteSessions();
        console.log('✅ All sessions cleared');
      } catch (e: any) {
        console.log('ℹ️ No sessions to clear:', e.message);
      }
    }
  },
  
  getCurrentUser: async (): Promise<Models.User<Models.Preferences> | null> => {
    try {
      const user = await account.get();
      console.log('✅ Got current user:', user.email);
      return user;
    } catch (error: any) {
      console.log('ℹ️ No current user (expected if not signed in):', error.message);
      return null;
    }
  },
  
  // Force clear all sessions - nuclear option for production issues
  clearAllSessions: async () => {
    try {
      await account.deleteSessions();
      console.log('✅ All sessions cleared (nuclear option)');
    } catch (error: any) {
      console.log('ℹ️ No sessions to clear:', error.message);
    }
  },
  
  // Health check for production debugging
  healthCheck: async () => {
    try {
      console.log('🔍 Appwrite Health Check:');
      console.log('- URL:', appwriteUrl);
      console.log('- Project ID:', appwriteProjectId);
      
      // Try to get service status (this doesn't require auth)
      const user = await account.get().catch(() => null);
      console.log('- Auth Status:', user ? 'Authenticated' : 'Not authenticated');
      
      return {
        status: 'healthy',
        authenticated: !!user,
        url: appwriteUrl,
        projectId: appwriteProjectId
      };
    } catch (error: any) {
      console.error('❌ Health check failed:', error.message);
      return {
        status: 'error',
        error: error.message,
        url: appwriteUrl,
        projectId: appwriteProjectId
      };
    }
  }
};

// Database helpers (using Appwrite databases)
export const db = {
  // Placeholder for database operations
  collection: (name: string) => ({
    // Will be implemented when we use Appwrite databases
  })
};
