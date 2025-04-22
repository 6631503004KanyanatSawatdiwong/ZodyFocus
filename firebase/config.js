// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBEmvll6lP5V6-WpPWr_ZyLJFwfyJBSsA",
  authDomain: "zodyfocus.firebaseapp.com",
  databaseURL: "https://zodyfocus-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zodyfocus",
  storageBucket: "zodyfocus.firebasestorage.app",
  messagingSenderId: "1003156842237",
  appId: "1:1003156842237:android:947879f7f4ec57a1ca0094",
};

// Initialize Firebase
let app;
let database;
let auth;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback initialization
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
}

export { app, database, auth }; 