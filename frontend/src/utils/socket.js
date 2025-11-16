// utils/socket.js
import { io } from 'socket.io-client';
import { store } from '../redux/store/store';
import { addNotification, setUnreadCount } from '../redux/slice/notificationSlice';
import { addRealTimeRequest, updateRequestStatus } from '../redux/slice/workRequestSlice';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io("https://product-0-neeav-1.onrender.com", {
            withCredentials: true,
            transports: ["websocket"],
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('new_notification', (data) => {
            console.log('📨 New notification received:', data);
            store.dispatch(addNotification(data.notification));
            store.dispatch(setUnreadCount(data.unreadCount));
        });

        this.socket.on('request_accepted', (data) => {
            console.log('✅ Request accepted:', data);
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'accepted'
            }));
        });

        this.socket.on('request_rejected', (data) => {
            console.log('❌ Request rejected:', data);
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'rejected'
            }));
        });


        this.socket.on('request_cancelled', (data) => {
            console.log('🚫 Request cancelled:', data);
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'cancelled'
            }));
        });

        this.socket.on('work_completed', (data) => {
            console.log('🎉 Work completed:', data);
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'completed'
            }));
        });

        this.socket.on('employee_contact', (data) => {
            // Handle employee contact notification
            store.dispatch(addNotification({
                title: 'Customer Service Follow-up',
                message: data.message,
                type: 'system',
                priority: 'high'
            }));
        });

        // Listen for NEW work requests (for contractors)
        this.socket.on('new_work_request', (data) => {
            console.log('🆕 New work request received:', data);
            store.dispatch(addRealTimeRequest(data.workRequest));
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();