
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace this with the new firebaseConfig object from the new project
const firebaseConfig = {
  apiKey: "AIzaSyCNSftfKdHRhscdFb1lRVJezwGP1-1X4xwA",
  authDomain: "orderchha-app.firebaseapp.com",
  projectId: "orderchha-app",
  storageBucket: "orderchha-app.firebaseapp.com",
  messagingSenderId: "442757956859",
  appId: "1:442757956859:web:54e6935d539b2607785c5e",
  measurementId: "G-QR6P8WW2Q4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
