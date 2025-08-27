// MIGRATION: Temporary Firebase stubs to prevent import errors
// These will be replaced with Appwrite + MongoDB

// Firebase/firestore stubs
export const doc = (...args: any[]) => ({ id: 'stub', ref: args[1] || 'stub' });
export const getDoc = (docRef?: any) => {
  // If requesting admin user, return admin data
  if (docRef && docRef.ref === 'lsg4BNvGAre9YZXGBaMonuAQR3h2') {
    return Promise.resolve({ 
      exists: () => true, 
      data: () => ({
        uid: 'lsg4BNvGAre9YZXGBaMonuAQR3h2',
        email: 'admin@orderchha.cafe',
        name: 'Admin',
        role: 'admin',
        designation: 'Super Admin',
        joiningDate: new Date().toISOString(),
        photoUrl: 'https://placehold.co/100x100.png',
      })
    });
  }
  return Promise.resolve({ exists: () => false, data: () => ({}) });
};
export const setDoc = () => Promise.resolve();
export const collection = () => ({ id: 'collection-stub' });
export const onSnapshot = (ref: any, callback: any) => {
  // Simulate empty snapshot immediately to unblock app loading
  setTimeout(() => {
    callback({ 
      empty: true, 
      docs: [],
      exists: () => false 
    });
  }, 100);
  return () => {}; // unsubscribe function
};
export const writeBatch = () => ({ 
  set: () => {}, 
  update: () => {}, 
  delete: () => {}, 
  commit: () => Promise.resolve() 
});
export const query = (collection: any) => collection;
export const deleteDoc = () => Promise.resolve();
export const getDocs = () => Promise.resolve({ docs: [] });
export const updateDoc = () => Promise.resolve();

// Firebase/auth stubs
export const getAuth = () => ({ currentUser: null });
export const onAuthStateChanged = (auth: any, callback: any) => {
  // Simulate admin user being logged in to unblock the app
  setTimeout(() => {
    callback({
      uid: 'lsg4BNvGAre9YZXGBaMonuAQR3h2', // Admin user ID from app-context
      email: 'admin@orderchha.cafe',
      displayName: 'Admin'
    });
  }, 50);
  return () => {}; // unsubscribe function
};
export const createUserWithEmailAndPassword = () => Promise.resolve({ user: { uid: 'stub' } });
export const signInWithEmailAndPassword = () => Promise.resolve({ user: { uid: 'stub' } });
export const signOut = () => Promise.resolve();

// Firebase/storage stubs  
export const getStorage = () => ({ name: 'storage-stub' });
export const ref = () => ({ name: 'ref-stub' });
export const uploadBytes = () => Promise.resolve({ ref: { name: 'uploaded-stub' } });
export const getDownloadURL = () => Promise.resolve('https://stub-url.com/stub.jpg');

// Types
export interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}
