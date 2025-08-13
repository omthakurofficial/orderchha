
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace this with the new firebaseConfig object from the new project
const firebaseConfig = {
  "projectId": "REPLACE_WITH_YOUR_PROJECT_ID",
  "appId": "REPLACE_WITH_YOUR_APP_ID",
  "storageBucket": "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  "apiKey": "REPLACE_WITH_YOUR_API_KEY",
  "authDomain": "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  "messagingSenderId": "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
