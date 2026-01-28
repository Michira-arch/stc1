/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare let self: ServiceWorkerGlobalScope;

// Take over control of the page immediately
self.skipWaiting();
clientsClaim();

// Precache resources
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Initialize Firebase (Needs hardcoded values or a way to inject env vars, 
// usually done via a separate build step or careful variable replacement if using Vite envs in SW)
// Note: Vite's import.meta.env IS available in proper injectManifest builds if configured correctly,
// but for Service Workers in some setups, it can be tricky. 
// However, since we are using 'src/sw.ts', Vite will process this file.

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
let messaging;

try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
} catch (e) {
    console.error('Failed to initialize Firebase in SW:', e);
}

if (messaging) {
    onBackgroundMessage(messaging, (payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        // Customize notification here
        const notificationTitle = payload.notification?.title || 'New Message';
        const notificationOptions = {
            body: payload.notification?.body,
            icon: '/pwa-192x192.png'
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
}
