
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD_kZlqX8o6b4o_j5e5r6g7h8i9j0k_l1m",
  authDomain: "orderchha-ra62f.firebaseapp.com",
  projectId: "orderchha-ra62f",
  storageBucket: "orderchha-ra62f.appspot.com",
  messagingSenderId: "712345678901",
  appId: "1:712345678901:web:1a2b3c4d5e6f7g8h9i0j",
  measurementId: "G-ABCDEFGHIJ"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, deleteDoc };
