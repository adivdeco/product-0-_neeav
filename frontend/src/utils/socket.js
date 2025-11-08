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
        this.socket = io('http://localhost:3000', {
            withCredentials: true,
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('new_notification', (data) => {
            store.dispatch(addNotification(data.notification));
            store.dispatch(setUnreadCount(data.unreadCount));
        });

        this.socket.on('request_accepted', (data) => {
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'accepted'
            }));
        });

        this.socket.on('request_rejected', (data) => {
            store.dispatch(updateRequestStatus({
                requestId: data.workRequest._id,
                status: 'rejected'
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