
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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

const collections = [
    'hero_slides',
    'featured_destinations',
    'services',
    'blogs',
    'settings',
    'tour_categories',
    'tour_packages'
];

async function clearAll() {
    console.log("STARTING HARD RESET...");
    for (const collName of collections) {
        console.log(`Checking ${collName}...`);
        const q = collection(db, collName);
        const snap = await getDocs(q);
        if (snap.empty) {
            console.log(`${collName} is already empty.`);
            continue;
        }
        console.log(`Deleting ${snap.size} documents from ${collName}...`);
        for (const d of snap.docs) {
            await deleteDoc(doc(db, collName, d.id));
        }
        console.log(`${collName} cleared.`);
    }
    console.log("HARD RESET COMPLETE!");
}

clearAll().catch(console.error);
