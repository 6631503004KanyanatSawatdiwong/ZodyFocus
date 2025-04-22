import { initializeApp, getApps } from "firebase/app";  // Import getApps to check if Firebase is initialized
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
//Prevents re-initialization during hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
