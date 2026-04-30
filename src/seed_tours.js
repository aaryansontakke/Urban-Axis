
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";
import path from "path";
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

async function uploadImage(fileName, folder) {
    const pathsToTry = [
        path.join(__dirname, "../public", fileName),
        path.join(__dirname, "assets/tours", fileName),
        path.join(__dirname, "../public/image", fileName),
    ];

    let filePath = null;
    for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
            filePath = p;
            break;
        }
    }

    if (!filePath) {
        console.warn(`File not found in any expected location: ${fileName}`);
        return "https://via.placeholder.com/800x600?text=Image+Not+Found";
    }
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
        return "https://via.placeholder.com/800x600?text=Upload+Error";
    }
}

async function seed() {
    console.log("Seeding Tours and Categories with REAL images...");
    try {
        // 1. Create Categories
        const catData = [
            { name: "Golden Triangle", type: "india", slug: "golden-triangle", image: "agra.jpg", display_order: 1 },
            { name: "Kerala Backwaters", type: "india", slug: "kerala", image: "kerla.jpg", display_order: 2 },
            { name: "Dubai Special", type: "international", slug: "dubai", image: "nepal.jpg", display_order: 3 }
        ];

        for (const cat of catData) {
            const imageUrl = await uploadImage(cat.image, 'categories');
            
            const docRef = await addDoc(collection(db, 'tour_categories'), {
                name: cat.name,
                type: cat.type,
                slug: cat.slug,
                image_url: imageUrl,
                display_order: cat.display_order,
                is_active: true,
                created_at: serverTimestamp()
            });
            console.log(`Created Category: ${cat.name} (${docRef.id})`);

            // 2. Create a Sample Package for each category
            await addDoc(collection(db, 'tour_packages'), {
                category_id: docRef.id,
                name: `${cat.name} Premium Tour`,
                description: `Experience the best of ${cat.name} with our exclusive premium package. This tour covers all major attractions and provides premium accommodation.`,
                price: 25000,
                nights: 5,
                start_city: "Delhi",
                end_city: "Delhi",
                route_covering: cat.name,
                image_url: imageUrl,
                is_active: true,
                is_featured: true,
                display_order: 1,
                created_at: serverTimestamp()
            });
            console.log(`Created Package for ${cat.name}`);
        }

        console.log("Seeding complete!");
    } catch (err) {
        console.error("Seeding failed:", err);
    }
}

seed();
