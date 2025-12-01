// import { io } from 'socket.io-client';
// import { store } from '../redux/store/store';
// import { addNotification, setUnreadCount } from '../redux/slice/notificationSlice';
// import { addRealTimeRequest, updateRequestStatus } from '../redux/slice/workRequestSlice';

// class SocketService {
//     constructor() {
//         this.socket = null;
//     }

//     connect() {
//         this.socket = io("https://product-0-neeav-1.onrender.com", {
//             withCredentials: true,
//             transports: ["websocket"],
//         });

//         this.socket.on('connect', () => {
//             console.log('Connected to server');
//         });

//         this.socket.on('new_notification', (data) => {
//             console.log('📨 New notification received:', data);
//             store.dispatch(addNotification(data.notification));
//             store.dispatch(setUnreadCount(data.unreadCount));
//         });

//         this.socket.on('request_accepted', (data) => {
//             console.log('✅ Request accepted:', data);
//             store.dispatch(updateRequestStatus({
//                 requestId: data.workRequest._id,
//                 status: 'accepted'
//             }));
//         });

//         this.socket.on('request_rejected', (data) => {
//             console.log('❌ Request rejected:', data);
//             store.dispatch(updateRequestStatus({
//                 requestId: data.workRequest._id,
//                 status: 'rejected'
//             }));
//         });


//         this.socket.on('request_cancelled', (data) => {
//             console.log('🚫 Request cancelled:', data);
//             store.dispatch(updateRequestStatus({
//                 requestId: data.workRequest._id,
//                 status: 'cancelled'
//             }));
//         });

//         this.socket.on('work_completed', (data) => {
//             console.log('🎉 Work completed:', data);
//             store.dispatch(updateRequestStatus({
//                 requestId: data.workRequest._id,
//                 status: 'completed'
//             }));
//         });

//         this.socket.on('employee_contact', (data) => {
//             // Handle employee contact notification
//             store.dispatch(addNotification({
//                 title: 'Customer Service Follow-up',
//                 message: data.message,
//                 type: 'system',
//                 priority: 'high'
//             }));
//         });

//         // Listen for NEW work requests (for contractors)
//         this.socket.on('new_work_request', (data) => {
//             console.log('🆕 New work request received:', data);
//             store.dispatch(addRealTimeRequest(data.workRequest));
//         });

//         this.socket.on('disconnect', () => {
//             console.log('Disconnected from server');
//         });
//     }

//     disconnect() {
//         if (this.socket) {
//             this.socket.disconnect();
//             this.socket = null;
//         }
//     }
// }

// export default new SocketService();

// import { io } from 'socket.io-client';
// import { store } from '../redux/store/store';
// import { addNotification, setUnreadCount } from '../redux/slice/notificationSlice';
// import { addRealTimeRequest, updateRequestStatus } from '../redux/slice/workRequestSlice';
// import { toast } from 'react-toastify';

// class SocketService {
//     constructor() {
//         this.socket = null;
//         this.isConnected = false;
//         this.connectionAttempts = 0;
//         this.maxConnectionAttempts = 3;
//     }

//     // Get token from cookies or localStorage
//     getToken() {
//         // Try to get token from cookies
//         const cookies = document.cookie.split(';');
//         const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
//         if (tokenCookie) {
//             return tokenCookie.split('=')[1];
//         }

//         // Try to get token from localStorage (if you store it there)
//         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//         return token;
//     }

//     connect() {
//         try {
//             const token = this.getToken();

//             if (!token) {
//                 console.warn('No authentication token found. Socket connection will not be established.');
//                 return;
//             }

//             console.log('🔐 Connecting socket with token...');

//             this.socket = io("https://product-0-neeav-1.onrender.com", {
//                 withCredentials: true,
//                 transports: ["websocket", "polling"],
//                 autoConnect: true,
//                 reconnection: true,
//                 reconnectionAttempts: 5,
//                 reconnectionDelay: 1000,
//                 auth: {
//                     token: token
//                 }
//             });

//             this.setupEventListeners();

//         } catch (error) {
//             console.error('Socket connection error:', error);
//         }
//     }

//     setupEventListeners() {
//         if (!this.socket) return;

//         this.socket.on('connect', () => {
//             console.log('✅ Connected to server');
//             this.isConnected = true;
//             this.connectionAttempts = 0;

//             // Join user-specific room after connection
//             const user = store.getState().auth.user;
//             if (user && user._id) {
//                 this.joinRoom(user._id);
//             }
//         });

//         this.socket.on('disconnect', (reason) => {
//             console.log('❌ Disconnected from server:', reason);
//             this.isConnected = false;
//         });

//         this.socket.on('connect_error', (error) => {
//             console.error('Socket connection error:', error);
//             this.connectionAttempts++;

//             if (this.connectionAttempts >= this.maxConnectionAttempts) {
//                 console.warn('Max connection attempts reached. Stopping retries.');
//                 this.socket.disconnect();
//             }

//             // If it's an authentication error, try to reconnect with fresh token
//             if (error.message.includes('Authentication') || error.message.includes('auth')) {
//                 console.log('🔄 Authentication error, attempting to reconnect...');
//                 setTimeout(() => {
//                     this.reconnectWithFreshToken();
//                 }, 2000);
//             }
//         });

//         this.socket.on('authenticated', () => {
//             console.log('🔓 Socket authenticated successfully');
//         });

//         this.socket.on('unauthorized', (error) => {
//             console.error('🔐 Socket authentication failed:', error);
//             toast.error('Connection authentication failed');
//         });

//         // Notification events
//         this.socket.on('new_notification', (data) => {
//             console.log('📨 New notification received:', data);
//             store.dispatch(addNotification(data.notification));
//             if (data.unreadCount !== undefined) {
//                 store.dispatch(setUnreadCount(data.unreadCount));
//             }
//         });

//         // Work request events
//         this.socket.on('request_accepted', (data) => {
//             console.log('✅ Request accepted:', data);
//             store.dispatch(updateRequestStatus({
//                 requestId: data.workRequest._id,
//                 status: 'accepted'
//             }));
//             toast.success(data.notification?.message || 'Request accepted!');
//         });

//         this.socket.on('request_rejected', (data) => {
//             console.log('❌ Request rejected:', data);
//             store.dispatch(updateRequestStatus({
//                 requestId: data.workRequest._id,
//                 status: 'rejected'
//             }));
//             toast.error(data.notification?.message || 'Request rejected');
//         });

//         this.socket.on('request_cancelled', (data) => {
//             console.log('🚫 Request cancelled:', data);
//             store.dispatch(updateRequestStatus({
//                 requestId: data.workRequest._id,
//                 status: 'cancelled'
//             }));
//             toast.info(data.notification?.message || 'Request cancelled');
//         });

//         this.socket.on('work_completed', (data) => {
//             console.log('🎉 Work completed:', data);
//             store.dispatch(updateRequestStatus({
//                 requestId: data.workRequest._id,
//                 status: 'completed'
//             }));
//             toast.success(data.notification?.message || 'Work completed!');
//         });

//         this.socket.on('employee_contact', (data) => {
//             console.log('👨‍💼 Employee contact:', data);
//             store.dispatch(addNotification({
//                 _id: Date.now().toString(),
//                 title: 'Customer Service Follow-up',
//                 message: data.message,
//                 type: 'employee_contact',
//                 priority: 'high',
//                 createdAt: new Date().toISOString(),
//                 isRead: false
//             }));
//             toast.info(`Customer service: ${data.message}`);
//         });

//         // New work requests for contractors
//         this.socket.on('new_work_request', (data) => {
//             console.log('🆕 New work request received:', data);
//             store.dispatch(addRealTimeRequest(data.workRequest));
//             toast.info(`New ${data.workRequest?.category} request received!`);
//         });

//         // Buy request events
//         this.socket.on('buy_request_accepted', (data) => {
//             console.log('✅ Buy request accepted:', data);
//             toast.success(data.notification?.message || 'Your purchase request was accepted!');
//         });

//         this.socket.on('buy_request_rejected', (data) => {
//             console.log('❌ Buy request rejected:', data);
//             toast.error(data.notification?.message || 'Your purchase request was declined');
//         });

//         this.socket.on('new_buy_request', (data) => {
//             console.log('🛒 New buy request received:', data);
//             const userRole = store.getState().auth.user?.role;
//             if (userRole === 'store_owner') {
//                 toast.info('New purchase request received!');
//             }
//         });

//         this.socket.on('buy_request_cancelled', (data) => {
//             console.log('🚫 Buy request cancelled:', data);
//             const userRole = store.getState().auth.user?.role;
//             if (userRole === 'store_owner') {
//                 toast.info('A purchase request was cancelled');
//             }
//         });

//         // Order status events
//         this.socket.on('order_shipped', (data) => {
//             console.log('🚚 Order shipped:', data);
//             toast.info('Your order has been shipped! 🚚');
//         });

//         this.socket.on('order_delivered', (data) => {
//             console.log('🎉 Order delivered:', data);
//             toast.success('Your order has been delivered! 🎉');
//         });
//     }

//     // Reconnect with fresh token
//     reconnectWithFreshToken() {
//         console.log('🔄 Attempting to reconnect with fresh token...');
//         this.disconnect();
//         setTimeout(() => {
//             this.connect();
//         }, 1000);
//     }

//     // Method to emit events
//     emit(event, data) {
//         if (this.socket && this.isConnected) {
//             this.socket.emit(event, data);
//         } else {
//             console.warn('Socket not connected, cannot emit event:', event);
//         }
//     }

//     // Method to join specific rooms
//     joinRoom(roomId) {
//         if (this.socket && this.isConnected) {
//             this.socket.emit('join_room', roomId);
//             console.log(`🔗 Joined room: ${roomId}`);
//         }
//     }

//     // Leave a room
//     leaveRoom(roomId) {
//         if (this.socket && this.isConnected) {
//             this.socket.emit('leave_room', roomId);
//             console.log(`🚪 Left room: ${roomId}`);
//         }
//     }

//     disconnect() {
//         if (this.socket) {
//             this.socket.disconnect();
//             this.socket = null;
//             this.isConnected = false;
//             this.connectionAttempts = 0;
//             console.log('🔌 Socket disconnected');
//         }
//     }

//     // Get connection status
//     getConnectionStatus() {
//         return this.isConnected;
//     }

//     // Check if user is authenticated
//     isAuthenticated() {
//         return !!this.getToken();
//     }
// }

// export default new SocketService();


// utils/socket.js - UPDATED VERSION
import { io } from 'socket.io-client';
import { store } from '../redux/store/store';
import { addNotification, setUnreadCount } from '../redux/slice/notificationSlice';
import { addRealTimeRequest, updateRequestStatus } from '../redux/slice/workRequestSlice';
import { buyRequestCancelled } from '../redux/slice/buyRequestSlice';
import { toast } from 'react-toastify';
import {
    orderShipped,
    orderDelivered
} from '../redux/slice/userBuyRequestSlice';


class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 5;
        this.reconnectDelay = 1000;
    }

    // IMPROVED token retrieval
    getToken() {
        try {
            console.log('🔍 Searching for token...');

            // 1. Check cookies first (most reliable)
            if (typeof document !== 'undefined') {
                const cookies = document.cookie.split(';');
                console.log('🍪 All cookies:', cookies);

                for (let cookie of cookies) {
                    const trimmed = cookie.trim();
                    if (trimmed.startsWith('token=')) {
                        const token = trimmed.substring(6);
                        console.log('✅ Token found in cookies:', token.substring(0, 10) + '...');
                        return token;
                    }
                }
            }

            // 2. Check localStorage
            if (typeof localStorage !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) {
                    console.log('✅ Token found in localStorage');
                    return token;
                }
            }

            // 3. Check sessionStorage
            if (typeof sessionStorage !== 'undefined') {
                const token = sessionStorage.getItem('token');
                if (token) {
                    console.log('✅ Token found in sessionStorage');
                    return token;
                }
            }

            // 4. Check Redux store (last resort)
            const state = store.getState();
            const authToken = state.auth?.token;
            if (authToken) {
                console.log('✅ Token found in Redux store');
                return authToken;
            }

            console.log('❌ No token found in any storage');
            return null;

        } catch (error) {
            console.error('❌ Error getting token:', error);
            return null;
        }
    }

    attachDebugCommands() {
        if (typeof window !== 'undefined') {
            window.socketDebug = {
                // Test events
                testShipped: () => this.testEvent('order_shipped', { status: 'shipped' }),
                testDelivered: () => this.testEvent('order_delivered', {
                    status: 'completed',
                    actualDelivery: new Date()
                }),
                testCancelled: () => this.testEvent('buy_request_cancelled', {
                    status: 'cancelled'
                }),

                // Check listeners
                checkListeners: () => {
                    const events = ['order_shipped', 'order_delivered', 'buy_request_cancelled'];
                    events.forEach(event => {
                        console.log(`${event}:`, this.socket?.listeners(event).length || 0, 'listener(s)');
                    });
                },

                // Test all
                testAll: () => this.testBuyRequestEvents(),

                // Connection status
                status: () => ({
                    connected: this.isConnected,
                    socketId: this.socket?.id,
                    connectionAttempts: this.connectionAttempts
                })
            };

            console.log('🔧 Socket debug commands attached to window.socketDebug');
        }
    }

    connect() {
        try {
            // Don't connect if already connected
            if (this.socket?.connected) {
                console.log('✅ Socket already connected');
                return;
            }

            const token = this.getToken();

            if (!token) {
                console.warn('❌ No authentication token found. Socket connection aborted.');
                // Let's check what's available for debugging
                this.debugTokenStorage();
                return;
            }

            console.log('🔐 Attempting socket connection with token...');

            // Disconnect existing socket if any
            if (this.socket) {
                this.socket.disconnect();
            }

            // DYNAMIC URL - Use localhost for development
            const isLocalDevelopment = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            const serverUrl = isLocalDevelopment
                ? 'http://localhost:3000'
                : 'https://product-0-neeav-1.onrender.com';

            console.log('🌐 Connecting to:', serverUrl);

            this.socket = io(serverUrl, {
                withCredentials: true,
                transports: ["websocket", "polling"],
                auth: {
                    token: token
                },
                reconnection: true,
                reconnectionAttempts: this.maxConnectionAttempts,
                reconnectionDelay: this.reconnectDelay,
                timeout: 20000
            });

            this.setupEventListeners();

        } catch (error) {
            console.error('❌ Socket connection error:', error);
        }
    }

    // Debug method to see what's in storage
    debugTokenStorage() {
        console.log('🐛 DEBUG Token Storage:');

        if (typeof document !== 'undefined') {
            console.log('🍪 Cookies:', document.cookie);
        }

        if (typeof localStorage !== 'undefined') {
            console.log('💾 localStorage token:', localStorage.getItem('token'));
        }

        if (typeof sessionStorage !== 'undefined') {
            console.log('💾 sessionStorage token:', sessionStorage.getItem('token'));
        }

        const state = store.getState();
        console.log('🔄 Redux auth state:', {
            isAuthenticated: state.auth?.isAuthenticated,
            user: state.auth?.user,
            token: state.auth?.token
        });
    }

    testEvent(eventName, testData = {}) {
        if (!this.socket || !this.isConnected) {
            console.log('❌ Socket not connected');
            return;
        }

        console.log(`🧪 Testing ${eventName} event...`);

        // Simulate receiving the event
        const testEventData = {
            buyRequest: {
                _id: 'test_' + Date.now(),
                user: { _id: 'test_user' },
                product: { name: 'Test Product' },
                ...testData
            },
            notification: {
                title: 'Test Notification',
                message: 'This is a test notification'
            }
        };

        // Trigger the event locally for testing
        this.socket.emit(eventName, testEventData);
    }

    // Test all buy request events
    testBuyRequestEvents() {
        console.log('🧪 Testing all buy request events...');

        const testEvents = [
            'new_buy_request',
            'buy_request_accepted',
            'buy_request_rejected',
            'buy_request_cancelled',
            'order_shipped',
            'order_delivered'
        ];

        testEvents.forEach(event => {
            setTimeout(() => {
                this.testEvent(event);
            }, testEvents.indexOf(event) * 1000);
        });
    }

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Socket connected successfully with ID:', this.socket.id);
            this.isConnected = true;
            this.connectionAttempts = 0;

            // Get current user from store and join user room
            const state = store.getState();
            const user = state.auth.user;

            if (user && user._id) {
                console.log('👤 Joining rooms for user:', user._id, 'role:', user.role);
                this.joinRoom(user._id);

                // Join role-specific rooms
                if (user.role === 'store_owner') {
                    this.joinRoom('store_owners');
                    console.log('🏪 Joined store_owners room');
                } else if (user.role === 'contractor') {
                    this.joinRoom('contractors');
                    console.log('👷 Joined contractors room');
                } else if (user.role === 'admin' || user.role === 'co-admin') {
                    this.joinRoom('admins');
                    console.log('👨‍💼 Joined admins room');
                }
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error.message);
            this.connectionAttempts++;

            if (this.connectionAttempts >= this.maxConnectionAttempts) {
                console.warn('🔄 Max connection attempts reached');
            }
        });

        this.socket.on('authenticated', (data) => {
            console.log('🔓 Socket authenticated successfully:', data);
        });

        this.socket.on('unauthorized', (error) => {
            console.error('🔐 Socket unauthorized:', error);
            toast.error('Socket authentication failed');
        });

        // BUY REQUEST EVENTS
        this.socket.on('new_buy_request', (data) => {
            console.log('🛒 REAL-TIME: New buy request received', data);
            store.dispatch(addNotification(data.notification));
            toast.success('📦 New purchase request received!');
        });

        this.socket.on('buy_request_accepted', (data) => {
            console.log('✅ REAL-TIME: Buy request accepted', data);
            toast.success(data.notification?.message || 'Your purchase was accepted!');
        });

        this.socket.on('buy_request_rejected', (data) => {
            console.log('❌ REAL-TIME: Buy request rejected', data);
            toast.error(data.notification?.message || 'Your purchase was declined');
        });

        this.socket.on('buy_request_cancelled', (data) => {
            console.log('🚫 REAL-TIME: Buy request cancelled', data);

            const user = store.getState().auth.user;
            if (user?.role === 'store_owner') {
                toast.info('A purchase request was cancelled');
                // Dispatch to shop owner's requests
                store.dispatch(buyRequestCancelled({
                    requestId: data.buyRequest._id
                }));
            }
        });

        // Order shipped event
        this.socket.on('order_shipped', (data) => {
            console.log('🚚 REAL-TIME: Order shipped', data);
            toast.info('Your order has been shipped! 🚚');

            // Dispatch to user's orders
            store.dispatch(orderShipped({
                requestId: data.buyRequest._id
            }));
        });

        this.socket.on('order_delivered', (data) => {
            console.log('🎉 REAL-TIME: Order delivered', data);
            toast.success('Your order has been delivered! 🎉');

            // Dispatch to user's orders
            store.dispatch(orderDelivered({
                requestId: data.buyRequest._id,
                actualDelivery: data.buyRequest.actualDelivery
            }));
        });

        // Notification events
        this.socket.on('new_notification', (data) => {
            console.log('📨 REAL-TIME: New notification', data);
            store.dispatch(addNotification(data.notification));
            if (data.unreadCount !== undefined) {
                store.dispatch(setUnreadCount(data.unreadCount));
            }
        });

        // Work request events
        this.socket.on('request_accepted', (data) => {
            console.log('✅ Request accepted:', data);
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'accepted'
            }));
            toast.success(data.notification?.message || 'Request accepted!');
        });

        this.socket.on('request_rejected', (data) => {
            console.log('❌ Request rejected:', data);
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'rejected'
            }));
            toast.error(data.notification?.message || 'Request rejected');
        });

        this.socket.on('request_cancelled', (data) => {
            console.log('🚫 Request cancelled:', data);
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'cancelled'
            }));
            toast.info(data.notification?.message || 'Request cancelled');
        });

        this.socket.on('work_completed', (data) => {
            console.log('🎉 Work completed:', data);
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'completed'
            }));
            toast.success(data.notification?.message || 'Work completed!');
        });

        this.socket.on('employee_contact', (data) => {
            console.log('👨‍💼 Employee contact:', data);
            store.dispatch(addNotification({
                _id: Date.now().toString(),
                title: 'Customer Service Follow-up',
                message: data.message,
                type: 'employee_contact',
                priority: 'high',
                createdAt: new Date().toISOString(),
                isRead: false
            }));
            toast.info(`Customer service: ${data.message}`);
        });

        // New work requests for contractors
        this.socket.on('new_work_request', (data) => {
            console.log('🆕 New work request received:', data);
            store.dispatch(addRealTimeRequest(data.workRequest));
            toast.info(`New ${data.workRequest?.category} request received!`);
        });
    }

    // Test connection
    testConnection() {
        if (this.socket && this.isConnected) {
            this.socket.emit('ping', { test: 'connection' });
            console.log('🏓 Ping sent');
        } else {
            console.log('❌ Cannot ping - socket not connected');
        }
    }

    joinRoom(roomId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join_room', roomId);
            console.log(`🔗 Joined room: ${roomId}`);
        }
    }

    leaveRoom(roomId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave_room', roomId);
            console.log(`🚪 Left room: ${roomId}`);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.connectionAttempts = 0;
            console.log('🔌 Socket disconnected manually');
        }
    }

    getConnectionStatus() {
        return this.isConnected;
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new SocketService();