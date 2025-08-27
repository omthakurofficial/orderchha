import { Client, Account, Databases, Storage, Functions, ID, Models } from 'appwrite';

// Appwrite configuration
const appwriteUrl = process.env.NEXT_PUBLIC_APPWRITE_URL;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!appwriteUrl || !appwriteProjectId) {
  throw new Error('Missing Appwrite environment variables. Please check NEXT_PUBLIC_APPWRITE_URL and NEXT_PUBLIC_APPWRITE_PROJECT_ID.');
}

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(appwriteUrl)
  .setProject(appwriteProjectId);

// Export services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Auth helpers (compatible with your existing Firebase auth usage)
export const auth = {
  signIn: async (email: string, password: string) => {
    const session = await account.createEmailSession(email, password);
    return session;
  },
  
  signUp: async (email: string, password: string, name: string) => {
    const user = await account.create(ID.unique(), email, password, name);
    return user;
  },
  
  signOut: async () => {
    await account.deleteSession('current');
  },
  
  getCurrentUser: async (): Promise<Models.User<Models.Preferences> | null> => {
    try {
      const user = await account.get();
      return user;
    } catch {
      return null;
    }
  },
  
  onAuthStateChange: (callback: (user: Models.User<Models.Preferences> | null) => void) => {
    // Check auth state on app load
    auth.getCurrentUser().then(callback);
    
    // For real-time auth state changes, you'd typically check periodically
    // or use Appwrite's realtime subscriptions for account updates
    return () => {}; // Return cleanup function
  }
};

// Database helpers (compatible with your existing Firestore usage)
export const db = {
  // Create document
  create: async (databaseId: string, collectionId: string, data: any, documentId?: string) => {
    const docId = documentId || ID.unique();
    return await databases.createDocument(databaseId, collectionId, docId, data);
  },
  
  // Get document
  get: async (databaseId: string, collectionId: string, documentId: string) => {
    return await databases.getDocument(databaseId, collectionId, documentId);
  },
  
  // Update document  
  update: async (databaseId: string, collectionId: string, documentId: string, data: any) => {
    return await databases.updateDocument(databaseId, collectionId, documentId, data);
  },
  
  // Delete document
  delete: async (databaseId: string, collectionId: string, documentId: string) => {
    return await databases.deleteDocument(databaseId, collectionId, documentId);
  },
  
  // List documents
  list: async (databaseId: string, collectionId: string, queries?: string[]) => {
    return await databases.listDocuments(databaseId, collectionId, queries);
  },
  
  // Subscribe to real-time updates
  subscribe: (databaseId: string, collectionId: string, callback: (response: any) => void) => {
    return client.subscribe(`databases.${databaseId}.collections.${collectionId}.documents`, callback);
  }
};

export { client, ID };
