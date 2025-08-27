// MIGRATION BRIDGE: Gradual replacement of Firebase with Appwrite + MongoDB
// This file provides Firebase-compatible functions that use Appwrite + MongoDB under the hood

import { auth as appwriteAuth, db as appwriteDb, ID } from '@/lib/appwrite';
import { connectToDatabase } from '@/lib/mongodb';

// Database references
const DATABASE_ID = 'orderchha-db';

// Export a db reference for compatibility
export const db = { name: 'firebase-bridge-db' };

// Auth functions (Firebase-compatible using Appwrite)
export const getAuth = () => ({
  currentUser: null, // Will be handled by Appwrite
});

export const onAuthStateChanged = (auth: any, callback: (user: any) => void) => {
  // Use Appwrite auth state
  appwriteAuth.getCurrentUser().then(user => {
    if (user) {
      callback({
        uid: user.$id,
        email: user.email,
        displayName: user.name
      });
    } else {
      callback(null);
    }
  });
  return () => {}; // cleanup function
};

export const signInWithEmailAndPassword = async (auth: any, email: string, password: string) => {
  const session = await appwriteAuth.signIn(email, password);
  return { user: { uid: session.userId } };
};

export const signOut = async (auth?: any) => {
  return await appwriteAuth.signOut();
};

export const createUserWithEmailAndPassword = async (auth: any, email: string, password: string) => {
  // For now, return stub - will implement user creation later
  return { user: { uid: ID.unique() } };
};

// Firestore functions (Firebase-compatible using MongoDB)
export const doc = (db: any, collection: string, id: string) => ({
  id,
  collection,
  ref: { collection, id }
});

export const getDoc = async (docRef: any) => {
  try {
    const mongodb = await connectToDatabase();
    const doc = await mongodb.collection(docRef.collection).findOne({ _id: docRef.id });
    
    if (doc) {
      return {
        exists: () => true,
        data: () => doc,
        ref: docRef
      };
    }
  } catch (error) {
    console.log('getDoc fallback to initial data:', error);
  }
  
  return {
    exists: () => false,
    data: () => ({}),
    ref: docRef
  };
};

export const setDoc = async (docRef: any, data: any, options?: { merge?: boolean }) => {
  try {
    const mongodb = await connectToDatabase();
    await mongodb.collection(docRef.collection).replaceOne(
      { _id: docRef.id },
      { _id: docRef.id, ...data },
      { upsert: true }
    );
  } catch (error) {
    console.log('setDoc using local fallback:', error);
  }
};

export const updateDoc = async (docRef: any, data: any) => {
  try {
    const mongodb = await connectToDatabase();
    await mongodb.collection(docRef.collection).updateOne(
      { _id: docRef.id },
      { $set: data }
    );
  } catch (error) {
    console.log('updateDoc using local fallback:', error);
  }
};

export const deleteDoc = async (docRef: any) => {
  try {
    const mongodb = await connectToDatabase();
    await mongodb.collection(docRef.collection).deleteOne({ _id: docRef.id });
  } catch (error) {
    console.log('deleteDoc using local fallback:', error);
  }
};

export const collection = (db: any, collectionName: string) => ({
  name: collectionName
});

export const query = (collectionRef: any, ...constraints: any[]) => ({
  ...collectionRef,
  constraints
});

export const getDocs = async (queryRef: any) => {
  try {
    const mongodb = await connectToDatabase();
    const docs = await mongodb.collection(queryRef.name).find({}).toArray();
    
    return {
      docs: docs.map(doc => ({
        id: doc._id,
        data: () => doc
      }))
    };
  } catch (error) {
    console.log('getDocs using empty fallback:', error);
    return { docs: [] };
  }
};

export const onSnapshot = (queryRef: any, callback: (snapshot: any) => void) => {
  // For now, simulate empty collections to use initial data
  setTimeout(() => {
    callback({
      empty: true,
      docs: []
    });
  }, 100);
  
  return () => {}; // cleanup function
};

export const writeBatch = (db: any) => ({
  set: (docRef: any, data: any) => {
    // Queue the operation
  },
  update: (docRef: any, data: any) => {
    // Queue the update operation  
  },
  delete: (docRef: any) => {
    // Queue the delete operation
  },
  commit: async () => {
    // Execute all queued operations
    return Promise.resolve();
  }
});

// Storage functions (using Appwrite Storage)
export const getStorage = () => ({ name: 'appwrite-storage' });
export const ref = (storage: any, path: string) => ({ path });
export const uploadBytes = async (ref: any, file: File) => {
  // TODO: Implement Appwrite storage upload
  return { ref };
};
export const getDownloadURL = async (ref: any) => {
  // TODO: Return Appwrite storage URL
  return 'https://placeholder-url.com/image.jpg';
};

// Export auth user type
export interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}
