importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Parse the query parameters from the service worker URL
const configParams = new URL(location.href).searchParams;

const firebaseConfig = {
    apiKey: configParams.get("apiKey"),
    authDomain: configParams.get("authDomain"),
    projectId: configParams.get("projectId"),
    storageBucket: configParams.get("storageBucket"),
    messagingSenderId: configParams.get("messagingSenderId"),
    appId: configParams.get("appId"),
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
