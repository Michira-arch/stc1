import { initializeApp } from "firebase/app";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App (safe on all platforms)
let app: any;

try {
    if (!firebaseConfig.projectId) {
        throw new Error('Firebase configuration is missing. Please check your .env file.');
    }
    app = initializeApp(firebaseConfig);

    // Initialize Analytics (safe — uses its own isSupported check)
    isAnalyticsSupported().then(supported => {
        if (supported) {
            getAnalytics(app);
        }
    });
} catch (error) {
    console.error('Firebase Initialization Error:', error);
}

// --- Lazy Messaging Getter ---
// DO NOT call getMessaging() at module load time.
// On iOS Safari (and other unsupported browsers), it throws and crashes the entire app.
// Instead, we expose an async getter that checks isSupported() first.
let messagingInstance: any = null;
let messagingResolved = false;

export const getMessagingInstance = async () => {
    if (messagingResolved) return messagingInstance;
    try {
        const supported = await isMessagingSupported();
        if (supported && app) {
            messagingInstance = getMessaging(app);
            console.log('[Firebase] Messaging initialized successfully.');
        } else {
            console.warn('[Firebase] Messaging not supported on this browser/context.');
        }
    } catch (e) {
        console.warn('[Firebase] Messaging init failed:', e);
        messagingInstance = null;
    }
    messagingResolved = true;
    return messagingInstance;
};

// Keep a synchronous export for backward compat, but it will be null until
// getMessagingInstance() is called. New code should use the async getter.
export { messagingInstance as messaging };
