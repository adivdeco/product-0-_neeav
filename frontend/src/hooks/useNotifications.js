// src/hooks/useNotifications.js - UPDATED WITH DEBUGGING
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
        console.log("🔔 useNotifications: INIT with userId:", userId);

        if (!userId) {
            console.log("❌ useNotifications: No userId, skipping setup");
            setLoading(false);
            return;
        }

        let isSubscribed = true;

        const initializeNotifications = async () => {
            try {
                setLoading(true);

                // Load existing notifications
                console.log("📥 useNotifications: Loading existing notifications...");
                const response = await axiosClient.get(`/notifications/${userId}`);
                if (isSubscribed) {
                    console.log("✅ useNotifications: Loaded", response.data?.length, "notifications");
                    console.log("📋 Notifications data:", response.data);
                    setNotifications(response.data || []);
                }

                // Setup socket with better error handling
                console.log("🔌 useNotifications: Setting up socket connection...");

                socket.auth = { userId };

                if (!socket.connected) {
                    console.log("🔄 useNotifications: Connecting socket...");
                    socket.connect();
                }

                // Wait for connection with timeout
                await new Promise((resolve, reject) => {
                    if (socket.connected) {
                        console.log("✅ useNotifications: Socket already connected");
                        resolve();
                        return;
                    }

                    const timeout = setTimeout(() => {
                        reject(new Error("Socket connection timeout after 5s"));
                    }, 5000);

                    socket.once('connect', () => {
                        clearTimeout(timeout);
                        console.log("✅ useNotifications: Socket connected successfully:", socket.id);
                        resolve();
                    });

                    socket.once('connect_error', (error) => {
                        clearTimeout(timeout);
                        console.error("❌ useNotifications: Socket connection failed:", error);
                        reject(error);
                    });
                });

                // Register user with socket
                console.log("📝 useNotifications: Registering user with socket server:", userId);
                socket.emit("register", userId, (response) => {
                    console.log("📝 useNotifications: Registration callback:", response);
                    if (response && response.success) {
                        console.log("✅ useNotifications: User registered successfully with socket");
                    } else {
                        console.log("⚠️ useNotifications: Registration response:", response);
                    }
                });

                // Setup FCM
                if ('serviceWorker' in navigator) {
                    try {
                        console.log("🔥 useNotifications: Setting up FCM...");
                        const token = await requestPermission();
                        if (token) {
                            await axiosClient.post('/notifications/notiUpdate', { userId, token });
                            console.log("✅ useNotifications: FCM token saved to backend");
                        } else {
                            console.log("⚠️ useNotifications: No FCM token obtained");
                        }
                    } catch (fcmError) {
                        console.error("❌ useNotifications: FCM setup failed:", fcmError);
                    }
                }

            } catch (error) {
                console.error("❌ useNotifications: Initialization failed:", error);
            } finally {
                if (isSubscribed) setLoading(false);
            }
        };

        initializeNotifications();

        // Socket event handler for notifications
        const onSocketNotif = (notif) => {
            console.log("🔔 useNotifications: REAL-TIME notification via socket:", notif);

            // Play sound if user has interacted
            if (userInteracted && audioRef.current) {
                try {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(e => console.log('Audio play failed:', e));
                } catch (error) {
                    console.error("❌ Audio playback failed:", error);
                }
            }

            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notif.title, {
                    body: notif.message,
                    icon: '/logo.png',
                    tag: 'new-notification'
                });
            }

            // Add to state
            setNotifications(prev => [notif, ...prev]);
        };

        // Socket event listeners
        socket.on("connect", () => {
            console.log("🔌 useNotifications: Socket connected, re-registering user:", userId);
            socket.emit("register", userId);
        });

        socket.on("disconnect", (reason) => {
            console.log("🔌 useNotifications: Socket disconnected:", reason);
        });

        socket.on("userRegistered", (data) => {
            console.log("✅ useNotifications: Server confirmed user registration:", data);
        });

        socket.on("new_notification", onSocketNotif);

        // FCM message listener
        if ('serviceWorker' in navigator) {
            onMessageListener((payload) => {
                console.log("📱 useNotifications: FCM foreground message:", payload);
                const notif = {
                    _id: Date.now().toString(),
                    title: payload?.notification?.title || 'Notification',
                    message: payload?.notification?.body || 'New message',
                    type: payload?.data?.type || 'system',
                    data: payload?.data,
                    isRead: false,
                    createdAt: new Date()
                };
                setNotifications(prev => [notif, ...prev]);
            });
        }

        return () => {
            console.log("🧹 useNotifications: Cleaning up...");
            isSubscribed = false;
            socket.off("new_notification", onSocketNotif);
            socket.off("connect");
            socket.off("disconnect");
            socket.off("userRegistered");
        };
    }, [userId, userInteracted]);

    return { notifications, setNotifications, loading };
}