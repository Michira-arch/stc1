import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../lib/firebase';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';

export const useFcm = () => {
    const { currentUser, showToast } = useApp();
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        Notification.permission
    );

    const requestPermission = async () => {
        // If messaging is not initialized (e.g. insecure context), return false
        if (!messaging) {
            console.warn("FCM messaging is not available.");
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.ready;

                // Get the token
                // You need your VAPID key here
                const currentToken = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });

                if (currentToken) {
                    setFcmToken(currentToken);

                    // Save token to Supabase only if user is logged in (has valid UUID, not 'guest')
                    if (currentUser?.id && currentUser.id !== 'guest') {
                        await saveTokenToDatabase(currentToken, currentUser.id);
                    }
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        } catch (err) {
            console.error('An error occurred while retrieving token.', err); // Added err argument for better debugging
            return false;
        }
    };

    // Check initial permission status without requesting
    useEffect(() => {
        if (Notification.permission === 'granted') {
            // If already granted, ensure we have the token (in case app was reloaded)
            requestPermission();
        }
    }, [currentUser]);

    useEffect(() => {
        if (!messaging) return;

        // Listen for foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            // Construct a toast or custom UI
            const title = payload.notification?.title || 'New Notification';
            const body = payload.notification?.body || '';
            showToast(`${title}: ${body}`, 'info');
        });

        return () => unsubscribe();
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
                console.error('Error saving FCM token:', error);
            }
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    };

    return { fcmToken, notificationPermission, requestPermission };
};
