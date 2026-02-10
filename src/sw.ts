/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

// Take over control of the page immediately
self.skipWaiting();
clientsClaim();

// Precache resources
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// --- IndexedDB helper to read notification preference ---
const DB_NAME = 'stc-settings';
const STORE_NAME = 'preferences';
const PREF_KEY = 'notifications_enabled';

// In-memory cache so we don't hit IDB on every push
let notifPrefCache: boolean = true;

function readNotifPref(): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(PREF_KEY);
                req.onsuccess = () => {
                    const val = req.result === undefined ? true : !!req.result;
                    notifPrefCache = val;
                    resolve(val);
                };
                req.onerror = () => resolve(true);
            };
            request.onerror = () => resolve(true);
        } catch {
            resolve(true);
        }
    });
}

// Listen for preference changes from the main thread
self.addEventListener('message', (event) => {
    if (event.data?.type === 'NOTIFICATION_PREF_CHANGED') {
        notifPrefCache = !!event.data.enabled;
        console.log('[SW] Notification preference updated:', notifPrefCache);
    }
});

// --- Push Notifications (Native Push API) ---
self.addEventListener('push', (event) => {
    console.log('[SW] Push event received:', event);

    event.waitUntil(
        readNotifPref().then((enabled) => {
            if (!enabled) {
                console.log('[SW] Notifications muted by user preference, skipping.');
                return;
            }

            let title = 'Student Center';
            let options: NotificationOptions = {
                body: 'You have a new notification.',
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
            };

            if (event.data) {
                try {
                    const data = event.data.json();
                    title = data.notification?.title || data.data?.title || title;
                    options = {
                        body: data.notification?.body || data.data?.body || options.body,
                        icon: data.notification?.icon || '/pwa-192x192.png',
                        badge: '/pwa-192x192.png',
                        data: data.data,
                    };
                } catch (e) {
                    console.warn('[SW] Failed to parse push data as JSON:', e);
                    options.body = event.data.text();
                }
            }

            return self.registration.showNotification(title, options).then(() => {
                // Set app badge (supported on Android Chrome + iOS 16.4+ PWAs)
                if ('setAppBadge' in navigator) {
                    (navigator as any).setAppBadge();
                }
            });
        })
    );
});

// Handle notification click — open the app and clear badge
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);
    event.notification.close();

    // Clear app badge
    if ('clearAppBadge' in navigator) {
        (navigator as any).clearAppBadge();
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            return self.clients.openWindow('/');
        })
    );
});

