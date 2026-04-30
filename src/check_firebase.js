
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBmH-3yhy0fo0BnRQIqQpIb2QgqjB3Q0H4",
    authDomain: "windows-10-assistant-98922.firebaseapp.com",
    projectId: "windows-10-assistant-98922",
    storageBucket: "windows-10-assistant-98922.firebasestorage.app",
    messagingSenderId: "932134898540",
    appId: "1:932134898540:web:bcc309f9be0fe54e074149"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    console.log("Checking Firestore connectivity...");
    try {
        const q = query(collection(db, 'tour_categories'), limit(1));
        const snap = await getDocs(q);
        console.log("Success! Found " + snap.size + " categories.");
        if (snap.size === 0) {
            console.log("Collections seem empty. Did you run the seeding script?");
        }
    } catch (err) {
        console.error("FAILED to connect to Firestore:");
        console.error(err.message);
        if (err.message.includes("Cloud Firestore API has not been used")) {
            console.log("\n>>> ACTION REQUIRED: You MUST enable the Firestore API in the Google Cloud Console.");
            console.log(">>> Link: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=windows-10-assistant-98922");
        }
    }
}

check();
