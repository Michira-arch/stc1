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

// --- Push Notifications (Native Push API) ---
// We use the native 'push' event instead of Firebase's onBackgroundMessage.
// This is more reliable across all platforms (especially iOS Safari PWA)
// and removes the Firebase SDK dependency from the service worker.

self.addEventListener('push', (event) => {
    console.log('[SW] Push event received:', event);

    let title = 'Student Center';
    let options: NotificationOptions = {
        body: 'You have a new notification.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
    };

    if (event.data) {
        try {
            const data = event.data.json();
            // FCM sends data in notification and/or data fields
            title = data.notification?.title || data.data?.title || title;
            options = {
                body: data.notification?.body || data.data?.body || options.body,
                icon: data.notification?.icon || '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                data: data.data, // Pass custom data for click handling
            };
        } catch (e) {
            // If JSON parsing fails, try plain text
            console.warn('[SW] Failed to parse push data as JSON:', e);
            options.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);
    event.notification.close();

    // Try to focus an existing window or open a new one
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If there's already an open window, focus it
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            return self.clients.openWindow('/');
        })
    );
});

