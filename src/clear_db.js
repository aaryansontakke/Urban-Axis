
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

async function clear() {
    console.log("Clearing all Firestore collections...");
    for (const collName of collections) {
        const snap = await getDocs(collection(db, collName));
        console.log(`Deleting ${snap.size} documents from ${collName}...`);
        const deletions = snap.docs.map(d => deleteDoc(doc(db, collName, d.id)));
        await Promise.all(deletions);
    }
    console.log("Clear complete!");
}

clear();
