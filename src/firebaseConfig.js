import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBmH-3yhy0fo0BnRQIqQpIb2QgqjB3Q0H4",
    authDomain: "windows-10-assistant-98922.firebaseapp.com",
    projectId: "windows-10-assistant-98922",
    storageBucket: "windows-10-assistant-98922.firebasestorage.app",
    messagingSenderId: "932134898540",
    appId: "1:932134898540:web:bcc309f9be0fe54e074149"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
