
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dt69gyvun/image/upload';
const UPLOAD_PRESET = 'Urban Axis';

async function uploadImage(filePath, folder) {
    console.log(`Uploading ${filePath}...`);
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    
    formData.append('file', blob, path.basename(filePath));
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Upload failed: ${errText}`);
        }

        const data = await response.json();
        console.log(`Uploaded: ${data.secure_url}`);
        return data.secure_url;
    } catch (error) {
        console.error(`Error uploading ${filePath}:`, error);
        return null;
    }
}

async function migrateHeroSlides() {
    console.log("Migrating Hero Slides...");
    const slides = [
        { img: "agra.jpg", title: "AGRA", sub: "Witness the timeless beauty of the Taj Mahal. A symbol of eternal love and a masterpiece of Mughal architecture." },
        { img: "kerla.jpg", title: "KERALA", sub: "Escape to God's Own Country. Experience the tranquil backwaters and lush tea plantations." },
        { img: "varansi.jpeg", title: "VARANASI", sub: "The city is known worldwide for its many ghats—steps leading down the steep river bank to the water—where pilgrims perform rituals." },
        { img: "jaipur.jpg", title: "JAIPUR", sub: "Explore the Pink City's royal heritage. Majestic forts and Rajputana history await you." },
        { img: "pondi.jpeg", title: "TAMIL NADU", sub: "Mamallapuram, or Mahabalipuram, is a town on a strip of land between the Bay of Bengal and the Great Salt Lake, in the south Indian state of Tamil Nadu." }
    ];

    const publicPath = path.join(__dirname, "../public");
    
    for (const slide of slides) {
        const filePath = path.join(publicPath, slide.img.startsWith('/') ? slide.img.slice(1) : slide.img);
        if (fs.existsSync(filePath)) {
            const url = await uploadImage(filePath, 'hero_slides');
            if (url) {
                await addDoc(collection(db, 'hero_slides'), {
                    image_url: url,
                    title: slide.title,
                    subtitle: slide.sub,
                    display_order: slides.indexOf(slide),
                    created_at: serverTimestamp()
                });
            }
        } else {
            console.warn(`File not found: ${filePath}`);
        }
    }
}

async function migrateFeaturedDestinations() {
    console.log("Migrating Featured Destinations...");
    const destinations = [
        { img: "nepal.jpg", title: "NEPAL", sub: "Majestic Himalayan peaks and spiritual traditions.", link: "/tours/international/nepal" },
        { img: "northeast.jpg", title: "THE BEST OF NORTH EAST", sub: "Explore Darjeeling, Gangtok, and Pelling.", link: "/tours/india/north-east" },
        { img: "telangana.jpg", title: "TELANGANA", sub: "Ancient architecture and divine serenity.", link: "/tours/india/telangana" },
        { img: "kashmir.jpg", title: "KASHMIR", sub: "Snow-capped peaks and tranquil waters.", link: "/tours/india/kashmir" },
        { img: "gujarat.jpg", title: "GUJARAT", sub: "White salt deserts and Asiatic Lions.", link: "/tours/india/gujarat" }
    ];

    const assetsPath = path.join(__dirname, "assets/tours");

    for (const dest of destinations) {
        const filePath = path.join(assetsPath, dest.img);
        if (fs.existsSync(filePath)) {
            const url = await uploadImage(filePath, 'featured_destinations');
            if (url) {
                await addDoc(collection(db, 'featured_destinations'), {
                    image_url: url,
                    title: dest.title,
                    subtitle: dest.sub,
                    link: dest.link,
                    display_order: destinations.indexOf(dest),
                    created_at: serverTimestamp()
                });
            }
        } else {
            console.warn(`File not found: ${filePath}`);
        }
    }
}

async function run() {
    try {
        await migrateHeroSlides();
        await migrateFeaturedDestinations();
        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    }
}

run();
