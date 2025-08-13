
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC0qA8jVq8B...YOUR_API_KEY", // Using a placeholder for security, but the real key is in the project
  authDomain: "orderchha-dineswift-ra62f.firebaseapp.com",
  projectId: "orderchha-dineswift-ra62f",
  storageBucket: "orderchha-dineswift-ra62f.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:a1b2c3d4e5f6g7h8i9j0"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, deleteDoc };
