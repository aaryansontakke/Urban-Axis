
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, getDocs, doc, setDoc } from "firebase/firestore";
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

async function uploadImage(filePath, folder) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return null;
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
        return null;
    }
}

async function seedHeroSlides() {
    console.log("Seeding Hero Slides...");
    const slides = [
        { img: "agra.jpg", title: "AGRA", sub: "Witness the timeless beauty of the Taj Mahal. A symbol of eternal love and a masterpiece of Mughal architecture." },
        { img: "kerla.jpg", title: "KERALA", sub: "Escape to God's Own Country. Experience the tranquil backwaters and lush tea plantations." },
        { img: "varansi.jpeg", title: "VARANASI", sub: "The city is known worldwide for its many ghats—steps leading down the steep river bank to the water—where pilgrims perform rituals." },
        { img: "jaipur.jpg", title: "JAIPUR", sub: "Explore the Pink City's royal heritage. Majestic forts and Rajputana history await you." },
        { img: "pondi.jpeg", title: "TAMIL NADU", sub: "Mamallapuram, or Mahabalipuram, is a town on a strip of land between the Bay of Bengal and the Great Salt Lake, in the south Indian state of Tamil Nadu." }
    ];
    for (let i = 0; i < slides.length; i++) {
        const url = await uploadImage(path.join(__dirname, "../public", slides[i].img.replace(/^\//, '')), 'hero_slides');
        if (url) {
            await addDoc(collection(db, 'hero_slides'), {
                image_url: url,
                title: slides[i].title,
                subtitle: slides[i].sub,
                display_order: i,
                created_at: serverTimestamp()
            });
        }
    }
}

async function seedFeaturedDestinations() {
    console.log("Seeding Featured Destinations...");
    const dests = [
        { img: "nepal.jpg", title: "NEPAL", sub: "Majestic Himalayan peaks and spiritual traditions.", link: "/tours/international/nepal" },
        { img: "northeast.jpg", title: "THE BEST OF NORTH EAST", sub: "Explore Darjeeling, Gangtok, and Pelling.", link: "/tours/india/north-east" },
        { img: "telangana.jpg", title: "TELANGANA", sub: "Ancient architecture and divine serenity.", link: "/tours/india/telangana" },
        { img: "kashmir.jpg", title: "KASHMIR", sub: "Snow-capped peaks and tranquil waters.", link: "/tours/india/kashmir" },
        { img: "gujarat.jpg", title: "GUJARAT", sub: "White salt deserts and Asiatic Lions.", link: "/tours/india/gujarat" }
    ];
    for (let i = 0; i < dests.length; i++) {
        const url = await uploadImage(path.join(__dirname, "assets/tours", dests[i].img), 'featured_destinations');
        if (url) {
            await addDoc(collection(db, 'featured_destinations'), {
                image_url: url,
                title: dests[i].title,
                subtitle: dests[i].sub,
                link: dests[i].link,
                display_order: i,
                created_at: serverTimestamp()
            });
        }
    }
}

async function seedServices() {
    console.log("Seeding Services...");
    const services = [
        { title: "Transportation", desc: "Your choice of cars and reliable services at the best available prices.", img: "Transportation.jpeg" },
        { title: "Hotels", desc: "Get the best hotel deals with our assurance of premium quality service.", img: "Hotels.jpeg" },
        { title: "Wedding Events", desc: "Every wedding we undertake is a unique package designed for your perfect day.", img: "Wedding.jpeg" },
        { title: "Flights", desc: "Time your flights to suit your holiday itinerary and eliminate delays.", img: "Flights.jpeg" },
        { title: "MICE", desc: "Specialized niche of group tourism dedicated to planning and facilitating conferences.", img: "Mice.jpeg" },
        { title: "Cruises", desc: "Find the right package and set sail for your dream cruise vacation.", img: "Cruises.jpeg" },
        { title: "Visa", desc: "Expert assistance in navigating international travel documentation.", img: "Visa.jpeg" },
        { title: "Passport", desc: "Facilitating appointments and documentation for swift passport processing.", img: "Passport.jpeg" },
        { title: "Forex", desc: "Authorized RBI retail forex dealers providing seamless currency solutions.", img: "Forex.jpeg" }
    ];
    for (let i = 0; i < services.length; i++) {
        const url = await uploadImage(path.join(__dirname, "../public/image", services[i].img), 'services');
        if (url) {
            await addDoc(collection(db, 'services'), {
                title: services[i].title,
                description: services[i].desc,
                image_url: url,
                display_order: i,
                created_at: serverTimestamp()
            });
        }
    }
}

async function seedBlogs() {
    console.log("Seeding Blogs...");
    const blogs = [
        { id: 1, title: "Top 7 Places To Travel after Pandemic in India", desc: "Reconnect with nature in the post-pandemic era.", category: "POST-PANDEMIC TRAVEL", image: "blog1.jpeg" },
        { id: 2, title: "Best Place to Visit & Have a memorable Pongal 2021", desc: "Our lifestyle changed upside down and now we need that fresh breeze.", category: "FESTIVAL SPECIAL", image: "blog22.jpeg" },
        { id: 3, title: "Rare Place to Visit in Tamil Nadu with Low Budget", desc: "Explore hidden gems without breaking the bank.", category: "BUDGET EXPLORATION", image: "blog3.jpeg" },
        { id: 4, title: "Best places to visit in India this Valentine’s Day", desc: "The one thing we look forward in the month of February is Valentine’s day.", category: "ROMANTIC EXCURSION", image: "blog4.jpeg" }
    ];
    for (let i = 0; i < blogs.length; i++) {
        const url = await uploadImage(path.join(__dirname, "../public", blogs[i].image), 'blogs');
        if (url) {
            await addDoc(collection(db, 'blogs'), {
                title: blogs[i].title,
                description: blogs[i].desc,
                category: blogs[i].category,
                image_url: url,
                display_order: i,
                created_at: serverTimestamp()
            });
        }
    }
}

async function seedSettings() {
    console.log("Seeding Settings...");
    const settings = [
        { key: 'india_hero_image', file: 'India2.jpeg' },
        { key: 'international_hero_image', file: 'International1.jpeg' },
        { key: 'about_hero_image', file: 'backgroundAbout.jpeg' }
    ];
    for (const s of settings) {
        const url = await uploadImage(path.join(__dirname, "../public", s.file), 'settings');
        if (url) {
            await setDoc(doc(db, 'settings', s.key), { value: url, updated_at: serverTimestamp() });
        }
    }
}

async function run() {
    try {
        await seedHeroSlides();
        await seedFeaturedDestinations();
        await seedServices();
        await seedBlogs();
        await seedSettings();
        console.log("Seeding complete!");
    } catch (err) {
        console.error("Seeding failed:", err);
    }
}

run();
