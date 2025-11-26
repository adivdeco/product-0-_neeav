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

import { io } from 'socket.io-client';
import { store } from '../redux/store/store';
import { addNotification, setUnreadCount } from '../redux/slice/notificationSlice';
import { addRealTimeRequest, updateRequestStatus } from '../redux/slice/workRequestSlice';
import { toast } from 'react-toastify';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 3;
    }

    // Get token from cookies or localStorage
    getToken() {
        // Try to get token from cookies
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
        if (tokenCookie) {
            return tokenCookie.split('=')[1];
        }

        // Try to get token from localStorage (if you store it there)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return token;
    }

    connect() {
        try {
            const token = this.getToken();

            if (!token) {
                console.warn('No authentication token found. Socket connection will not be established.');
                return;
            }

            console.log('🔐 Connecting socket with token...');

            this.socket = io("https://product-0-neeav-1.onrender.com", {
                withCredentials: true,
                transports: ["websocket", "polling"],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                auth: {
                    token: token
                }
            });

            this.setupEventListeners();

        } catch (error) {
            console.error('Socket connection error:', error);
        }
    }

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Connected to server');
            this.isConnected = true;
            this.connectionAttempts = 0;

            // Join user-specific room after connection
            const user = store.getState().auth.user;
            if (user && user._id) {
                this.joinRoom(user._id);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.connectionAttempts++;

            if (this.connectionAttempts >= this.maxConnectionAttempts) {
                console.warn('Max connection attempts reached. Stopping retries.');
                this.socket.disconnect();
            }

            // If it's an authentication error, try to reconnect with fresh token
            if (error.message.includes('Authentication') || error.message.includes('auth')) {
                console.log('🔄 Authentication error, attempting to reconnect...');
                setTimeout(() => {
                    this.reconnectWithFreshToken();
                }, 2000);
            }
        });

        this.socket.on('authenticated', () => {
            console.log('🔓 Socket authenticated successfully');
        });

        this.socket.on('unauthorized', (error) => {
            console.error('🔐 Socket authentication failed:', error);
            toast.error('Connection authentication failed');
        });

        // Notification events
        this.socket.on('new_notification', (data) => {
            console.log('📨 New notification received:', data);
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

        // Buy request events
        this.socket.on('buy_request_accepted', (data) => {
            console.log('✅ Buy request accepted:', data);
            toast.success(data.notification?.message || 'Your purchase request was accepted!');
        });

        this.socket.on('buy_request_rejected', (data) => {
            console.log('❌ Buy request rejected:', data);
            toast.error(data.notification?.message || 'Your purchase request was declined');
        });

        this.socket.on('new_buy_request', (data) => {
            console.log('🛒 New buy request received:', data);
            const userRole = store.getState().auth.user?.role;
            if (userRole === 'store_owner') {
                toast.info('New purchase request received!');
            }
        });

        this.socket.on('buy_request_cancelled', (data) => {
            console.log('🚫 Buy request cancelled:', data);
            const userRole = store.getState().auth.user?.role;
            if (userRole === 'store_owner') {
                toast.info('A purchase request was cancelled');
            }
        });

        // Order status events
        this.socket.on('order_shipped', (data) => {
            console.log('🚚 Order shipped:', data);
            toast.info('Your order has been shipped! 🚚');
        });

        this.socket.on('order_delivered', (data) => {
            console.log('🎉 Order delivered:', data);
            toast.success('Your order has been delivered! 🎉');
        });
    }

    // Reconnect with fresh token
    reconnectWithFreshToken() {
        console.log('🔄 Attempting to reconnect with fresh token...');
        this.disconnect();
        setTimeout(() => {
            this.connect();
        }, 1000);
    }

    // Method to emit events
    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit event:', event);
        }
    }

    // Method to join specific rooms
    joinRoom(roomId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join_room', roomId);
            console.log(`🔗 Joined room: ${roomId}`);
        }
    }

    // Leave a room
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
            console.log('🔌 Socket disconnected');
        }
    }

    // Get connection status
    getConnectionStatus() {
        return this.isConnected;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new SocketService();