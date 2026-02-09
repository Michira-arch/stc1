import { useEffect, useState, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from '../lib/firebase';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';

export const useFcm = () => {
    const { currentUser, showToast } = useApp();
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const unsubscribeRef = useRef<(() => void) | null>(null);

    const requestPermission = async () => {
        // Safety check for Notification API
        if (typeof Notification === 'undefined') {
            console.warn("[FCM] Notification API not supported in this browser.");
            return false;
        }

        // Get messaging instance (returns null on unsupported browsers like iOS Safari in-browser)
        const messaging = await getMessagingInstance();
        if (!messaging) {
            console.warn("[FCM] Messaging not available on this platform.");
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.ready;
                console.log('[FCM] SW scope:', registration.scope);
                console.log('[FCM] SW state:', registration.active?.state);
                console.log('[FCM] SW scriptURL:', registration.active?.scriptURL);

                // Check existing push subscription for debugging
                const existingSub = await registration.pushManager.getSubscription();
                console.log('[FCM] Existing push subscription:', existingSub ? 'yes' : 'none');

                const currentToken = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });

                if (currentToken) {
                    console.log('[FCM] Token acquired:', currentToken.substring(0, 20) + '...');
                    setFcmToken(currentToken);

                    // Save token to Supabase only if user is logged in (has valid UUID, not 'guest')
                    if (currentUser?.id && currentUser.id !== 'guest') {
                        await saveTokenToDatabase(currentToken, currentUser.id);
                    }
                    return true;
                } else {
                    console.warn('[FCM] No token returned.');
                    return false;
                }
            }
            return false;
        } catch (err) {
            console.error('[FCM] Error retrieving token:', err);
            return false;
        }
    };

    // If permission is already granted, re-acquire token on mount/user change
    useEffect(() => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            requestPermission();
        }
    }, [currentUser]);

    // Set up foreground message listener
    useEffect(() => {
        let cancelled = false;

        const setupListener = async () => {
            const messaging = await getMessagingInstance();
            if (!messaging || cancelled) return;

            // Clean up previous listener if any
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }

            unsubscribeRef.current = onMessage(messaging, (payload) => {
                const title = payload.notification?.title || 'New Notification';
                const body = payload.notification?.body || '';
                showToast(`${title}: ${body}`, 'info');
            });
        };

        setupListener();

        return () => {
            cancelled = true;
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [showToast]);

    const saveTokenToDatabase = async (token: string, userId: string) => {
        try {
            const { error } = await supabase
                .from('fcm_tokens')
                .upsert({
                    user_id: userId,
                    token: token,
                    platform: 'web',
                    last_seen_at: new Date().toISOString()
                }, { onConflict: 'token' });

            if (error) {
                console.error('[FCM] Error saving token:', error);
            } else {
                console.log('[FCM] Token saved to database.');
            }
        } catch (error) {
            console.error('[FCM] Error saving token:', error);
        }
    };

    return { fcmToken, notificationPermission, requestPermission };
};

