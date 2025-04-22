import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, update, onValue, push } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBBEmvll6lP5V6-WpPWr_ZyLJFwfyJBSsA",
    authDomain: "zodyfocus.firebaseapp.com",
    databaseURL: "https://zodyfocus-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "zodyfocus",
    storageBucket: "zodyfocus.firebasestorage.app",
    messagingSenderId: "1003156842237",
    appId: "1:1003156842237:android:947879f7f4ec57a1ca0094",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { app, database, auth, ref, get, set, update, onValue, push };