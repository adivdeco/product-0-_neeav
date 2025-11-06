
// src/firebase.js - UPDATED VERSION
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;

// Only initialize messaging in supported environments
const initializeMessaging = async () => {
    try {
        if (await isSupported()) {
            messaging = getMessaging(app);
            console.log("✅ FCM supported and initialized");
        } else {
            console.warn("❌ FCM not supported in this environment");
        }
    } catch (error) {
        console.error("❌ FCM initialization failed:", error);
    }
};

initializeMessaging();

export const requestPermission = async () => {
    try {
        if (!messaging) {
            console.warn("Messaging not available");
            return null;
        }

        // Request notification permission
        const permission = await Notification.requestPermission();
        console.log("🔔 Notification permission:", permission);

        if (permission === "granted") {
            console.log("✅ Notification permission granted");

            // Register service worker
            try {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log("✅ Service Worker registered:", registration);

                // Get FCM token
                const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
                if (!vapidKey) {
                    console.error("❌ VAPID key not found in environment variables");
                    return null;
                }

                const token = await getToken(messaging, {
                    vapidKey: vapidKey,
                    serviceWorkerRegistration: registration
                });

                console.log("📱 FCM Token obtained:", token);
                return token;

            } catch (swError) {
                console.error("❌ Service Worker registration failed:", swError);
                return null;
            }

        } else {
            console.warn("❌ Notification permission not granted");
            return null;
        }
    } catch (error) {
        console.error("❌ Error getting FCM token:", error);
        return null;
    }
};

export const getFcmToken = async (vapidKey) => {
    try {
        if (!messaging) {
            console.warn("Messaging not available");
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Notification permission denied");
            return null;
        }

        // Get existing service worker registration or register new one
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log("✅ Service Worker registered for FCM");
        }

        const token = await getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration
        });

        console.log("✅ FCM Token generated");
        return token;
    } catch (err) {
        console.error("❌ FCM token error", err);
        return null;
    }
};

export function onMessageListener(callback) {
    if (!messaging) {
        console.warn("Messaging not available for onMessage");
        return;
    }
    onMessage(messaging, (payload) => {
        console.log("📱 Foreground message received:", payload);
        callback(payload);
    });
}

export { messaging };
