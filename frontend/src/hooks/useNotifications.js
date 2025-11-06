



// src/hooks/useNotifications.js - UPDATED FOR FCM
import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { getFcmToken, onMessageListener, requestPermission } from "../firebase";
import axiosClient from "../api/auth";

export default function useNotifications(userId) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef(null);
    const [userInteracted, setUserInteracted] = useState(false);

    useEffect(() => {
        // console.log("🔔 useNotifications: INIT with userId:", userId);

        // Initialize audio
        audioRef.current = new Audio("/notifaction.mp3");
        audioRef.current.preload = "auto";

        // Listen for user interaction to unlock audio
        const handleFirstInteraction = () => {
            // console.log("✅ User interacted - audio unlocked");
            setUserInteracted(true);

            audioRef.current.volume = 0.001;
            audioRef.current.play().then(() => {
                // console.log("✅ Audio context unlocked");
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.volume = 1.0;
            }).catch(err => {
                console.error("❌ Audio unlock failed:", err);
            });
        };


        document.addEventListener('click', handleFirstInteraction, { once: true });

        if (!userId) {
            // console.log("❌ useNotifications: No userId, skipping setup");
            setLoading(false);
            return;
        }

        let isSubscribed = true;

        const initializeNotifications = async () => {
            try {
                setLoading(true);

                // 1. Load existing notifications
                // console.log("📥 useNotifications: Loading existing notifications...");
                const response = await axiosClient.get(`/notifications/${userId}`);
                if (isSubscribed) {
                    // console.log("✅ useNotifications: Loaded", response.data?.length, "notifications");
                    setNotifications(response.data || []);
                }

                // 2. Setup socket
                // console.log("🔌 useNotifications: Setting up socket...");
                socket.auth = { userId };
                socket.connect();

                await new Promise((resolve) => {
                    if (socket.connected) resolve();
                    socket.once('connect', resolve);
                });

                socket.emit("register", userId);
                // console.log("✅ useNotifications: Socket registered for user:", userId);

                // 3. Setup FCM with enhanced error handling
                // console.log("📱 useNotifications: Setting up FCM...");

                // Check if service workers are supported
                if ('serviceWorker' in navigator) {
                    try {
                        // Request permission and get token
                        const token = await requestPermission();

                        if (token) {
                            console.log("💾 Saving FCM token to backend...");
                            await axiosClient.post('/notifications/notiUpdate', {
                                userId,
                                token
                            });
                            console.log("✅ FCM token saved to backend");
                        } else {
                            console.warn("⚠️ No FCM token obtained");
                        }
                    } catch (fcmError) {
                        console.error("❌ FCM setup failed:", fcmError);
                    }
                } else {
                    console.warn("❌ Service Workers not supported - FCM unavailable");
                }

            } catch (error) {
                console.error("❌ useNotifications: Initialization failed:", error);
            } finally {
                if (isSubscribed) setLoading(false);
            }
        };

        initializeNotifications();

        // Enhanced audio playback
        const playNotificationSound = async () => {
            if (!userInteracted) {
                // console.log("⏸️ Audio blocked: user hasn't interacted with page yet");
                return;
            }

            try {
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
                console.log("✅ Notification sound played");
            } catch (error) {
                console.error("❌ Failed to play notification sound:", error);
            }
        };

        // Socket event handler
        const onSocketNotif = (notif) => {
            // console.log("🔔 useNotifications: REAL-TIME notification via socket:", notif);
            playNotificationSound();
            setNotifications(prev => [notif, ...prev]);
        };

        // FCM foreground handler
        const onFcmMessage = (payload) => {
            console.log("📱 useNotifications: FCM foreground message:", payload);
            const notif = {
                title: payload?.notification?.title || 'Notification',
                message: payload?.notification?.body || 'New message',
                data: payload?.data,
                isRead: false,
                createdAt: new Date()
            };
            playNotificationSound();
            setNotifications(prev => [notif, ...prev]);
        };

        // Subscribe to events
        socket.on("new_notification", onSocketNotif);

        // Only setup FCM listener if supported
        if ('serviceWorker' in navigator) {
            onMessageListener(onFcmMessage);
        }

        return () => {
            // console.log("🧹 useNotifications: Cleaning up...");
            isSubscribed = false;
            socket.off("new_notification", onSocketNotif);
            socket.disconnect();
            document.removeEventListener('click', handleFirstInteraction);
        };
    }, [userId, userInteracted]);

    return { notifications, setNotifications, loading };
}