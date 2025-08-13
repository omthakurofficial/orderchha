
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your_firebase_api_key_here",
  authDomain: "orderchha-dineswift-ra62f.firebaseapp.com",
  projectId: "orderchha-dineswift-ra62f",
  storageBucket: "orderchha-dineswift-ra62f.appspot.com",
  messagingSenderId: "982935276537",
  appId: "1:982935276537:web:806201a43a3cf421f66d49"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, deleteDoc };
