import { initializeApp } from "firebase/app";
import { getDatabase, ref, Database, DatabaseReference } from "firebase/database";

// Firebase configuration - uses environment variables or falls back to direct config
// To use: Create a Firebase project at console.firebase.google.com
// Enable Realtime Database and copy your config values here or to .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return !!(firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId);
};

// Initialize Firebase only if configured
let db: Database | null = null;
let configRef: DatabaseReference | null = null;

if (isFirebaseConfigured()) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    configRef = ref(db, "hyper-tracker/config");
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
  }
}

export { db, configRef };
