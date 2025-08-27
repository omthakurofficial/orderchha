
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, deleteDoc } from 'firebase/firestore';

// Parse the Firebase config from the environment variable
const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

if (!firebaseConfigString) {
    throw new Error("Firebase config not found. Please set NEXT_PUBLIC_FIREBASE_CONFIG in your environment variables.");
}

const firebaseConfig = JSON.parse(firebaseConfigString);


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, deleteDoc };
