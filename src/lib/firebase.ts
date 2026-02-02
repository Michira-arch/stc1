import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
let messaging: any;

try {
    if (!firebaseConfig.projectId) {
        throw new Error('Firebase configuration is missing. Please check your .env file.');
    }
    app = initializeApp(firebaseConfig);
    try {
        messaging = getMessaging(app);
    } catch (e) {
        console.warn('Firebase Messaging not supported (likely insecure context or missing features):', e);
        messaging = null;
    }

    // Initialize Analytics (Measurement)
    isSupported().then(supported => {
        if (supported) {
            getAnalytics(app);
        }
    });
} catch (error) {
    console.error('Firebase Initialization Error:', error);
}

export { messaging };
