import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'stc-settings';
const STORE_NAME = 'preferences';
const KEY = 'notifications_enabled';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getNotificationPreference(): Promise<boolean> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(KEY);
            req.onsuccess = () => {
                // Default to true if not set
                resolve(req.result === undefined ? true : !!req.result);
            };
            req.onerror = () => resolve(true); // default on
        });
    } catch {
        return true; // default on if IndexedDB fails
    }
}

export async function setNotificationPreference(enabled: boolean): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(enabled, KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        // silently fail
    }
}

/**
 * Hook to read/write the notification mute preference stored in IndexedDB.
 * The SW checks this flag before showing notifications.
 */
export function useNotificationPreference() {
    const [enabled, setEnabled] = useState(true); // default on
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getNotificationPreference().then((val) => {
            setEnabled(val);
            setLoaded(true);
        });
    }, []);

    const toggle = useCallback(async (newVal: boolean) => {
        setEnabled(newVal);
        await setNotificationPreference(newVal);
        // Notify the active SW so it picks up the change immediately
        const reg = await navigator.serviceWorker?.ready;
        reg?.active?.postMessage({ type: 'NOTIFICATION_PREF_CHANGED', enabled: newVal });
    }, []);

    return { notificationsEnabled: enabled, setNotificationsEnabled: toggle, loaded };
}
