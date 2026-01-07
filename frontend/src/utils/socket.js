
// import { io } from 'socket.io-client';
// import { store } from '../redux/store/store';
// import { addNotification, setUnreadCount } from '../redux/slice/notificationSlice';
// import { addRealTimeRequest, updateRequestStatus, updateUserRequestStatus, handleNewWorkRequest } from '../redux/slice/workRequestSlice';
// import { buyRequestCancelled } from '../redux/slice/buyRequestSlice';
// import { toast } from 'react-toastify';
// import {
//     orderShipped,
//     orderDelivered
// } from '../redux/slice/userBuyRequestSlice';


// class SocketService {
//     constructor() {
//         this.socket = null;
//         this.isConnected = false;
//         this.connectionAttempts = 0;
//         this.maxConnectionAttempts = 5;
//         this.reconnectDelay = 1000;
//     }

//     // IMPROVED token retrieval
//     getToken() {
//         try {
//             console.log('🔍 Searching for token...');

//             // 1. Check cookies first (most reliable)
//             if (typeof document !== 'undefined') {
//                 const cookies = document.cookie.split(';');
//                 console.log('🍪 All cookies:', cookies);

//                 for (let cookie of cookies) {
//                     const trimmed = cookie.trim();
//                     if (trimmed.startsWith('token=')) {
//                         const token = trimmed.substring(6);
//                         console.log('✅ Token found in cookies:', token.substring(0, 10) + '...');
//                         return token;
//                     }
//                 }
//             }

//             // 2. Check localStorage
//             if (typeof localStorage !== 'undefined') {
//                 const token = localStorage.getItem('token');
//                 if (token) {
//                     console.log('✅ Token found in localStorage');
//                     return token;
//                 }
//             }

//             // 3. Check sessionStorage
//             if (typeof sessionStorage !== 'undefined') {
//                 const token = sessionStorage.getItem('token');
//                 if (token) {
//                     console.log('✅ Token found in sessionStorage');
//                     return token;
//                 }
//             }

//             // 4. Check Redux store (last resort)
//             const state = store.getState();
//             const authToken = state.auth?.token;
//             if (authToken) {
//                 console.log('✅ Token found in Redux store');
//                 return authToken;
//             }

//             console.log('❌ No token found in any storage');
//             return null;

//         } catch (error) {
//             console.error('❌ Error getting token:', error);
//             return null;
//         }
//     }

//     // attachDebugCommands() {
//     //     if (typeof window !== 'undefined') {
//     //         window.socketDebug = {
//     //             // Test events
//     //             testShipped: () => this.testEvent('order_shipped', { status: 'shipped' }),
//     //             testDelivered: () => this.testEvent('order_delivered', {
//     //                 status: 'completed',
//     //                 actualDelivery: new Date()
//     //             }),
//     //             testCancelled: () => this.testEvent('buy_request_cancelled', {
//     //                 status: 'cancelled'
//     //             }),

//     //             // Check listeners
//     //             checkListeners: () => {
//     //                 const events = ['order_shipped', 'order_delivered', 'buy_request_cancelled'];
//     //                 events.forEach(event => {
//     //                     console.log(`${event}:`, this.socket?.listeners(event).length || 0, 'listener(s)');
//     //                 });
//     //             },

//     //             // Test all
//     //             testAll: () => this.testBuyRequestEvents(),

//     //             // Connection status
//     //             status: () => ({
//     //                 connected: this.isConnected,
//     //                 socketId: this.socket?.id,
//     //                 connectionAttempts: this.connectionAttempts
//     //             })
//     //         };

//     //         console.log('🔧 Socket debug commands attached to window.socketDebug');
//     //     }
//     // }
//     attachDebugCommands() {
//         if (typeof window !== 'undefined') {
//             window.socketDebug = {
//                 // Test work request events
//                 testWorkRequest: () => {
//                     console.log('🧪 Testing work request flow...');

//                     // Simulate a new work request
//                     const testData = {
//                         workRequest: {
//                             _id: 'test_' + Date.now(),
//                             user: { _id: 'test_user', name: 'Test User' },
//                             assignedContractor: { _id: 'test_contractor', name: 'Test Contractor' },
//                             title: 'Test Plumbing Work',
//                             category: 'plumbing',
//                             status: 'pending'
//                         },
//                         notification: {
//                             _id: 'test_notif_' + Date.now(),
//                             title: 'New Work Request',
//                             message: 'You have a new plumbing request from Test User',
//                             type: 'work_request',
//                             isRead: false,
//                             createdAt: new Date()
//                         }
//                     };

//                     // Emit the event as if from server
//                     if (this.socket) {
//                         this.socket.emit('new_work_request', testData);
//                         console.log('✅ Test work request emitted');
//                     }
//                 },

//                 // Check room membership
//                 checkRooms: () => {
//                     console.log('🏠 Checking room membership...');
//                     const state = store.getState();
//                     const user = state.auth.user;
//                     console.log('Current user:', user);

//                     if (user?.role === 'contractor') {
//                         console.log('✅ Contractor should be in "contractors" room');
//                         this.joinRoom('contractors');
//                     }
//                 },

//                 // Test all events
//                 testAllEvents: () => {
//                     console.log('🧪 Testing all socket events...');
//                     const events = [
//                         'new_work_request',
//                         'request_accepted',
//                         'request_rejected',
//                         'request_cancelled',
//                         'work_completed'
//                     ];

//                     events.forEach(event => {
//                         setTimeout(() => {
//                             this.testWorkRequestEvent(event);
//                         }, events.indexOf(event) * 1000);
//                     });
//                 },

//                 // Connection status
//                 status: () => ({
//                     connected: this.isConnected,
//                     socketId: this.socket?.id,
//                     connectionAttempts: this.connectionAttempts
//                 })
//             };

//             console.log('🔧 Socket debug commands attached to window.socketDebug');
//         }
//     }

//     testWorkRequestEvent(eventName, testData = {}) {
//         if (!this.socket || !this.isConnected) {
//             console.log('❌ Socket not connected');
//             return;
//         }

//         console.log(`🧪 Testing ${eventName} event...`);

//         // Simulate receiving the event
//         const testEventData = {
//             workRequest: {
//                 _id: 'test_' + Date.now(),
//                 user: { _id: 'test_user', name: 'Test User' },
//                 assignedContractor: { _id: 'test_contractor', name: 'Test Contractor' },
//                 title: 'Test Work Request',
//                 category: 'plumbing',
//                 status: 'pending',
//                 ...testData
//             },
//             notification: {
//                 _id: 'test_notif_' + Date.now(),
//                 title: 'Test Notification',
//                 message: 'This is a test notification',
//                 type: eventName,
//                 isRead: false,
//                 createdAt: new Date()
//             }
//         };

//         // Trigger the event locally for testing
//         this.socket.emit(eventName, testEventData);
//     }

//     connect() {
//         try {
//             // Don't connect if already connected
//             if (this.socket?.connected) {
//                 console.log('✅ Socket already connected');
//                 return;
//             }

//             const token = this.getToken();

//             if (!token) {
//                 console.warn('❌ No authentication token found. Socket connection aborted.');
//                 // Let's check what's available for debugging
//                 this.debugTokenStorage();
//                 return;
//             }

//             console.log('🔐 Attempting socket connection with token...');

//             // Disconnect existing socket if any
//             if (this.socket) {
//                 this.socket.disconnect();
//             }

//             // DYNAMIC URL - Use localhost for development
//             const isLocalDevelopment = window.location.hostname === 'localhost' ||
//                 window.location.hostname === '127.0.0.1';

//             const serverUrl = isLocalDevelopment
//                 ? 'http://localhost:3000'
//                 : 'https://product-0-neeav-1.onrender.com';

//             console.log('🌐 Connecting to:', serverUrl);

//             this.socket = io(serverUrl, {
//                 withCredentials: true,
//                 transports: ["websocket", "polling"],
//                 auth: {
//                     token: token
//                 },
//                 reconnection: true,
//                 reconnectionAttempts: this.maxConnectionAttempts,
//                 reconnectionDelay: this.reconnectDelay,
//                 timeout: 20000
//             });

//             this.setupEventListeners();

//         } catch (error) {
//             console.error('❌ Socket connection error:', error);
//         }
//     }

//     debugNotification(data) {
//         console.log('🔍 DEBUG Notification Data:', {
//             hasNotification: !!data.notification,
//             notificationKeys: data.notification ? Object.keys(data.notification) : 'none',
//             notificationType: data.notification?.type,
//             hasUnreadCount: data.unreadCount !== undefined,
//             unreadCount: data.unreadCount
//         });
//     }

//     // Debug method to see what's in storage
//     // debugTokenStorage() {
//     //     console.log('🐛 DEBUG Token Storage:');

//     //     if (typeof document !== 'undefined') {
//     //         console.log('🍪 Cookies:', document.cookie);
//     //     }

//     //     if (typeof localStorage !== 'undefined') {
//     //         console.log('💾 localStorage token:', localStorage.getItem('token'));
//     //     }

//     //     if (typeof sessionStorage !== 'undefined') {
//     //         console.log('💾 sessionStorage token:', sessionStorage.getItem('token'));
//     //     }

//     //     const state = store.getState();
//     //     console.log('🔄 Redux auth state:', {
//     //         isAuthenticated: state.auth?.isAuthenticated,
//     //         user: state.auth?.user,
//     //         token: state.auth?.token
//     //     });
//     // }

//     // testEvent(eventName, testData = {}) {
//     //     if (!this.socket || !this.isConnected) {
//     //         console.log('❌ Socket not connected');
//     //         return;
//     //     }

//     //     console.log(`🧪 Testing ${eventName} event...`);

//     //     // Simulate receiving the event
//     //     const testEventData = {
//     //         buyRequest: {
//     //             _id: 'test_' + Date.now(),
//     //             user: { _id: 'test_user' },
//     //             product: { name: 'Test Product' },
//     //             ...testData
//     //         },
//     //         notification: {
//     //             title: 'Test Notification',
//     //             message: 'This is a test notification'
//     //         }
//     //     };

//     //     // Trigger the event locally for testing
//     //     this.socket.emit(eventName, testEventData);
//     // }

//     // Test all buy request events
//     // testBuyRequestEvents() {
//     //     console.log('🧪 Testing all buy request events...');

//     //     const testEvents = [
//     //         'new_buy_request',
//     //         'buy_request_accepted',
//     //         'buy_request_rejected',
//     //         'buy_request_cancelled',
//     //         'order_shipped',
//     //         'order_delivered'
//     //     ];

//     //     testEvents.forEach(event => {
//     //         setTimeout(() => {
//     //             this.testEvent(event);
//     //         }, testEvents.indexOf(event) * 1000);
//     //     });
//     // }

//     setupEventListeners() {
//         if (!this.socket) return;

//         this.socket.on('connect', () => {
//             console.log('✅ Socket connected successfully with ID:', this.socket.id);
//             this.isConnected = true;
//             this.connectionAttempts = 0;

//             // Get current user from store and join user room
//             const state = store.getState();
//             const user = state.auth.user;

//             if (user && user._id) {
//                 console.log('👤 Joining rooms for user:', user._id, 'role:', user.role);
//                 this.joinRoom(user._id);

//                 // Join role-specific rooms
//                 if (user.role === 'store_owner') {
//                     this.joinRoom('store_owners');
//                     console.log('🏪 Joined store_owners room');
//                 } else if (user.role === 'contractor') {
//                     this.joinRoom('contractors');  // ✅ THIS IS CRITICAL!
//                     console.log('👷 Joined contractors room');
//                 } else if (user.role === 'admin' || user.role === 'co-admin') {
//                     this.joinRoom('admins');
//                     console.log('👨‍💼 Joined admins room');
//                 }
//             }
//         });

//         this.socket.on('disconnect', (reason) => {
//             console.log('❌ Socket disconnected:', reason);
//             this.isConnected = false;
//         });

//         this.socket.on('connect_error', (error) => {
//             console.error('🔌 Socket connection error:', error.message);
//             this.connectionAttempts++;

//             if (this.connectionAttempts >= this.maxConnectionAttempts) {
//                 console.warn('🔄 Max connection attempts reached');
//             }
//         });

//         this.socket.on('authenticated', (data) => {
//             console.log('🔓 Socket authenticated successfully:', data);
//         });

//         this.socket.on('unauthorized', (error) => {
//             console.error('🔐 Socket unauthorized:', error);
//             toast.error('Socket authentication failed');
//         });

//         // BUY REQUEST EVENTS
//         this.socket.on('new_buy_request', (data) => {
//             console.log('🛒 REAL-TIME: New buy request received', data);
//             store.dispatch(addNotification(data.notification));
//             toast.success('📦 New purchase request received!');
//         });

//         this.socket.on('buy_request_accepted', (data) => {
//             console.log('✅ REAL-TIME: Buy request accepted', data);
//             toast.success(data.notification?.message || 'Your purchase was accepted!');
//         });

//         this.socket.on('buy_request_rejected', (data) => {
//             console.log('❌ REAL-TIME: Buy request rejected', data);
//             toast.error(data.notification?.message || 'Your purchase was declined');
//         });

//         this.socket.on('buy_request_cancelled', (data) => {
//             console.log('🚫 REAL-TIME: Buy request cancelled', data);

//             const user = store.getState().auth.user;
//             if (user?.role === 'store_owner') {
//                 toast.info('A purchase request was cancelled');
//                 // Dispatch to shop owner's requests
//                 store.dispatch(buyRequestCancelled({
//                     requestId: data.buyRequest._id
//                 }));
//             }
//         });

//         // Order shipped event
//         this.socket.on('order_shipped', (data) => {
//             console.log('🚚 REAL-TIME: Order shipped', data);
//             toast.info('Your order has been shipped! 🚚');

//             // Dispatch to user's orders
//             store.dispatch(orderShipped({
//                 requestId: data.buyRequest._id
//             }));
//         });

//         this.socket.on('order_delivered', (data) => {
//             console.log('🎉 REAL-TIME: Order delivered', data);
//             toast.success('Your order has been delivered! 🎉');

//             // Dispatch to user's orders
//             store.dispatch(orderDelivered({
//                 requestId: data.buyRequest._id,
//                 actualDelivery: data.buyRequest.actualDelivery
//             }));
//         });

//         // Notification events

//         // this.socket.on('new_notification', (data) => {
//         //     console.log('📨 REAL-TIME: New notification', data);
//         //     store.dispatch(addNotification(data.notification));
//         //     if (data.unreadCount !== undefined) {
//         //         store.dispatch(setUnreadCount(data.unreadCount));
//         //     }
//         // });

//         this.socket.on('new_notification', (data) => {
//             console.log('📨 REAL-TIME: New notification received', data);

//             this.debugNotification(data);

//             // ✅ ADD NOTIFICATION DIRECTLY TO REDUX
//             if (data.notification) {
//                 console.log('📝 Adding notification to Redux:', data.notification._id);
//                 store.dispatch(addNotification(data.notification));
//             }

//             // ✅ UPDATE UNREAD COUNT
//             if (data.unreadCount !== undefined) {
//                 console.log('🔢 Updating unread count:', data.unreadCount);
//                 store.dispatch(setUnreadCount(data.unreadCount));
//             }

//         });

//         // Work request events
//         this.socket.on('new_work_request', (data) => {
//             console.log('🆕 REAL-TIME: New work request received', data);

//             const user = store.getState().auth.user;
//             if (user?.role === 'contractor') {
//                 toast.info(`New ${data.workRequest?.category} request received!`);

//                 // ✅ ALSO dispatch to notifications
//                 if (data.notification) {
//                     store.dispatch(addNotification(data.notification));
//                 }
//             }
//         });

//         this.socket.on('request_accepted', (data) => {
//             console.log('✅ REAL-TIME: Request accepted', data);

//             // Show toast
//             toast.success(data.notification?.message || 'Your request was accepted!');

//             // ✅ ALSO dispatch to notifications
//             if (data.notification) {
//                 store.dispatch(addNotification(data.notification));
//             }
//         });

//         this.socket.on('request_rejected', (data) => {
//             console.log('❌ REAL-TIME: Request rejected', data);

//             // Show toast
//             toast.error(data.notification?.message || 'Your request was declined');

//             // ✅ ALSO dispatch to notifications
//             if (data.notification) {
//                 store.dispatch(addNotification(data.notification));
//             }
//         });

//         this.socket.on('request_cancelled', (data) => {
//             console.log('🚫 REAL-TIME: Request cancelled', data);

//             const user = store.getState().auth.user;
//             const workRequest = data.workRequest;

//             // Show toast to contractor
//             if (user?.role === 'contractor' &&
//                 (user._id === workRequest.assignedContractor?._id || user._id === workRequest.assignedContractor)) {
//                 toast.info(data.notification?.message || 'A work request was cancelled');

//                 // Update Redux state for contractor's requests
//                 store.dispatch(updateUserRequestStatus({
//                     requestId: workRequest._id,
//                     status: 'cancelled'
//                 }));
//             }

//             // Also update user's view
//             if (user?._id === workRequest.user?._id || user?._id === workRequest.user) {
//                 store.dispatch(updateRequestStatus({
//                     requestId: workRequest._id,
//                     status: 'cancelled'
//                 }));
//             }
//         });

//         this.socket.on('work_completed', (data) => {
//             console.log('🎉 REAL-TIME: Work completed', data);

//             const user = store.getState().auth.user;
//             const workRequest = data.workRequest;

//             // Show toast to contractor
//             if (user?.role === 'contractor' &&
//                 (user._id === workRequest.assignedContractor?._id || user._id === workRequest.assignedContractor)) {
//                 toast.success(data.notification?.message || 'Work marked as completed!');

//                 // Update Redux state for contractor's requests
//                 store.dispatch(updateUserRequestStatus({
//                     requestId: workRequest._id,
//                     status: 'completed'
//                 }));
//             }

//             // Show toast to user
//             if (user?._id === workRequest.user?._id || user?._id === workRequest.user) {
//                 toast.success(data.notification?.message || 'Your work has been completed!');

//                 // Update Redux state for user's requests
//                 store.dispatch(updateRequestStatus({
//                     requestId: workRequest._id,
//                     status: 'completed'
//                 }));
//             }
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


//     }

//     // Add test function for work requests
//     testWorkRequestEvents() {
//         console.log('🧪 Testing all work request events...');

//         const testEvents = [
//             'new_work_request',
//             'request_accepted',
//             'request_rejected',
//             'request_cancelled',
//             'work_completed'
//         ];

//         testEvents.forEach(event => {
//             setTimeout(() => {
//                 this.testWorkRequestEvent(event);
//             }, testEvents.indexOf(event) * 1500);
//         });
//     }

//     testWorkRequestEvent(eventName, testData = {}) {
//         if (!this.socket || !this.isConnected) {
//             console.log('❌ Socket not connected');
//             return;
//         }

//         console.log(`🧪 Testing ${eventName} event...`);

//         // Simulate receiving the event
//         const testEventData = {
//             workRequest: {
//                 _id: 'test_' + Date.now(),
//                 user: { _id: 'test_user', name: 'Test User' },
//                 assignedContractor: { _id: 'test_contractor', name: 'Test Contractor' },
//                 title: 'Test Work Request',
//                 category: 'plumbing',
//                 status: 'pending',
//                 ...testData
//             },
//             notification: {
//                 _id: 'test_notif_' + Date.now(),
//                 title: 'Test Notification',
//                 message: 'This is a test notification',
//                 type: eventName,
//                 isRead: false,
//                 createdAt: new Date()
//             }
//         };

//         // Trigger the event locally for testing
//         this.socket.emit(eventName, testEventData);
//     }

//     // // Test connection
//     // testConnection() {
//     //     if (this.socket && this.isConnected) {
//     //         this.socket.emit('ping', { test: 'connection' });
//     //         console.log('🏓 Ping sent');
//     //     } else {
//     //         console.log('❌ Cannot ping - socket not connected');
//     //     }
//     // }

//     joinRoom(roomId) {
//         if (this.socket && this.isConnected) {
//             this.socket.emit('join_room', roomId);
//             console.log(`🔗 Joined room: ${roomId}`);
//         }
//     }

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
//             console.log('🔌 Socket disconnected manually');
//         }
//     }

//     getConnectionStatus() {
//         return this.isConnected;
//     }

//     isAuthenticated() {
//         return !!this.getToken();
//     }
// }

// export default new SocketService();

import { io } from 'socket.io-client';
import { store } from '../redux/store/store';
import { addNotification, setUnreadCount } from '../redux/slice/notificationSlice';
import { updateUserRequestStatus, updateRequestStatus } from '../redux/slice/workRequestSlice';
import { buyRequestCancelled } from '../redux/slice/buyRequestSlice';
import { toast } from 'react-toastify';
import { orderShipped, orderDelivered } from '../redux/slice/userBuyRequestSlice';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 5;
        this.reconnectDelay = 1000;
    }

    // Simplified token retrieval
    getToken() {
        try {
            // Check cookies first (most reliable)
            if (typeof document !== 'undefined') {
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    const trimmed = cookie.trim();
                    if (trimmed.startsWith('token=')) {
                        return trimmed.substring(6);
                    }
                }
            }

            // Check localStorage
            if (typeof localStorage !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) return token;
            }

            // Check Redux store
            const state = store.getState();
            const authToken = state.auth?.token;
            if (authToken) return authToken;

            return null;
        } catch (error) {
            console.error('❌ Error getting token:', error);
            return null;
        }
    }

    connect() {
        try {
            // Don't connect if already connected
            if (this.socket?.connected) {
                return;
            }

            const token = this.getToken();
            if (!token) {
                console.warn('❌ No authentication token found');
                return;
            }

            // Disconnect existing socket if any
            if (this.socket) {
                this.socket.disconnect();
            }

            // DYNAMIC URL
            const isLocalDevelopment = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            const serverUrl = isLocalDevelopment
                ? 'http://localhost:3001'
                : 'https://product-0-neeav-1.onrender.com';

            console.log('🌐 Connecting to:', serverUrl);

            this.socket = io(serverUrl, {
                withCredentials: true,
                transports: ["websocket", "polling"],
                auth: { token },
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

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Socket connected with ID:', this.socket.id);
            this.isConnected = true;
            this.connectionAttempts = 0;

            // Join user-specific and role-specific rooms
            const state = store.getState();
            const user = state.auth.user;

            if (user && user._id) {
                this.joinRoom(user._id);

                if (user.role === 'store_owner') {
                    this.joinRoom('store_owners');
                } else if (user.role === 'contractor') {
                    this.joinRoom('contractors');
                } else if (user.role === 'admin' || user.role === 'co-admin') {
                    this.joinRoom('admins');
                }
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔌 Connection error:', error.message);
            this.connectionAttempts++;
        });

        // BUY REQUEST EVENTS
        this.socket.on('new_buy_request', (data) => {
            console.log('🛒 New buy request:', data);
            if (data.notification) store.dispatch(addNotification(data.notification));
            toast.success('📦 New purchase request received!');
        });

        this.socket.on('buy_request_accepted', (data) => {
            console.log('✅ Buy request accepted:', data);
            toast.success(data.notification?.message || 'Your purchase was accepted!');
        });

        this.socket.on('buy_request_rejected', (data) => {
            console.log('❌ Buy request rejected:', data);
            toast.error(data.notification?.message || 'Your purchase was declined');
        });

        this.socket.on('buy_request_cancelled', (data) => {
            console.log('🚫 Buy request cancelled:', data);
            const user = store.getState().auth.user;
            if (user?.role === 'store_owner') {
                toast.info('A purchase request was cancelled');
                store.dispatch(buyRequestCancelled({ requestId: data.buyRequest._id }));
            }
        });

        this.socket.on('order_shipped', (data) => {
            console.log('🚚 Order shipped:', data);
            toast.info('Your order has been shipped! 🚚');
            store.dispatch(orderShipped({ requestId: data.buyRequest._id }));
        });

        this.socket.on('order_delivered', (data) => {
            console.log('🎉 Order delivered:', data);
            toast.success('Your order has been delivered! 🎉');
            store.dispatch(orderDelivered({
                requestId: data.buyRequest._id,
                actualDelivery: data.buyRequest.actualDelivery
            }));
        });

        // UNIFIED NOTIFICATION HANDLER
        this.socket.on('new_notification', (data) => {
            console.log('📨 New notification received:', data);

            const currentNotifications = store.getState().notifications.notifications;
            if (data.notification) {
                const exists = currentNotifications.some(n => n._id === data.notification._id);
                if (!exists) {
                    store.dispatch(addNotification(data.notification));
                }
            }

            // Update unread count if provided
            if (data.unreadCount !== undefined) {
                store.dispatch(setUnreadCount(data.unreadCount));
            }
        });

        // WORK REQUEST EVENTS
        this.socket.on('new_work_request', (data) => {
            console.log('🆕 New work request:', data);
            const user = store.getState().auth.user;
            if (user?.role === 'contractor') {
                toast.info(`New ${data.workRequest?.category} request received!`);
                if (data.notification) store.dispatch(addNotification(data.notification));
            }
        });

        this.socket.on('request_accepted', (data) => {
            console.log('✅ Request accepted:', data);
            toast.success(data.notification?.message || 'Your request was accepted!');
            if (data.notification) store.dispatch(addNotification(data.notification));
        });

        this.socket.on('request_rejected', (data) => {
            console.log('❌ Request rejected:', data);
            toast.error(data.notification?.message || 'Your request was declined');
            if (data.notification) store.dispatch(addNotification(data.notification));
        });

        this.socket.on('request_cancelled', (data) => {
            console.log('🚫 Request cancelled:', data);
            const user = store.getState().auth.user;
            const workRequest = data.workRequest;

            if (user?.role === 'contractor' &&
                (user._id === workRequest.assignedContractor?._id || user._id === workRequest.assignedContractor)) {
                toast.info(data.notification?.message || 'A work request was cancelled');
                store.dispatch(updateUserRequestStatus({
                    requestId: workRequest._id,
                    status: 'cancelled'
                }));
            }
        });

        this.socket.on('work_completed', (data) => {
            console.log('🎉 Work completed:', data);
            const user = store.getState().auth.user;
            const workRequest = data.workRequest;

            if (user?.role === 'contractor' &&
                (user._id === workRequest.assignedContractor?._id || user._id === workRequest.assignedContractor)) {
                toast.success(data.notification?.message || 'Work marked as completed!');
                store.dispatch(updateUserRequestStatus({
                    requestId: workRequest._id,
                    status: 'completed'
                }));
            }
        });
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
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.connectionAttempts = 0;
        }
    }

    getConnectionStatus() {
        return this.isConnected;
    }
}

export default new SocketService();