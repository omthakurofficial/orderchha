
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, deleteDoc } from 'firebase/firestore';

// Parse the Firebase config from the environment variable
const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

let firebaseConfig;

if (firebaseConfigString) {
    try {
        firebaseConfig = JSON.parse(firebaseConfigString);
    } catch (error) {
        console.error("Failed to parse Firebase config:", error);
        console.error("Config string:", firebaseConfigString);
        throw new Error("Invalid Firebase config JSON. Please check your NEXT_PUBLIC_FIREBASE_CONFIG environment variable.");
    }
} else {
    // Fallback to the config from firebase-config.json for development
    try {
        firebaseConfig = require('../../firebase-config.json');
    } catch (error) {
        throw new Error("Firebase config not found. Please set NEXT_PUBLIC_FIREBASE_CONFIG in your environment variables or ensure firebase-config.json exists.");
    }
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, deleteDoc };
