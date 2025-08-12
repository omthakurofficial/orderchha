
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "dineswift-ra62f",
  "appId": "1:875442706709:web:831b73d0f7748baa3d311c",
  "storageBucket": "dineswift-ra62f.firebasestorage.app",
  "apiKey": "AIzaSyCgBg4mHPG1dZ6RUXUfQ4DnIP8T11zFVW4",
  "authDomain": "dineswift-ra62f.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "875442706709"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
