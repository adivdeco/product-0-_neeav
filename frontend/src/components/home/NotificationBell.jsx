import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAsRead, markAllAsRead } from '../../redux/slice/notificationSlice';
import { PiBellRingingFill } from "react-icons/pi";
import SocketService from '../../utils/socket'; // Import socket
import {
    Bell,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    ShoppingCart,
    Truck,
    Package,
    Star,
    CheckCircle2,
    MessageSquare,
    Wrench,
    Building
} from 'lucide-react';
import { useNavigate } from 'react-router';

const NotificationBell = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notifications, unreadCount } = useSelector((state) => state.notifications);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        dispatch(getNotifications({ page: 1, unreadOnly: false }));

        // Listen for real-time notifications
        const handleNewNotification = (data) => {
            console.log('🔔 Real-time notification in bell:', data);
            dispatch(getNotifications({ page: 1, unreadOnly: false }));
        };

        if (SocketService.socket) {
            SocketService.socket.on('new_notification', handleNewNotification);
        }

        return () => {
            if (SocketService.socket) {
                SocketService.socket.off('new_notification', handleNewNotification);
            }
        };

    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (notificationId, e) => {
        e.stopPropagation();
        await dispatch(markAsRead(notificationId));
    };

    const handleMarkAllAsRead = async (e) => {
        e.stopPropagation();
        await dispatch(markAllAsRead());
    };

    const getNotificationIcon = (type) => {
        const iconClass = "w-5 h-5";
        switch (type) {
            case 'work_request':
                return <Wrench className={`${iconClass} text-blue-600`} />;
            case 'request_accepted':
                return <CheckCircle2 className={`${iconClass} text-green-600`} />;
            case 'request_rejected':
                return <XCircle className={`${iconClass} text-red-600`} />;
            case 'work_completed':
                return <Star className={`${iconClass} text-yellow-600`} />;
            case 'status_updated':
                return <Clock className={`${iconClass} text-purple-600`} />;
            case 'buy_request':
                return <ShoppingCart className={`${iconClass} text-orange-600`} />;
            case 'buy_request_accepted':
                return <CheckCircle className={`${iconClass} text-green-600`} />;
            case 'buy_request_rejected':
                return <XCircle className={`${iconClass} text-red-600`} />;
            case 'order_shipped':
                return <Truck className={`${iconClass} text-indigo-600`} />;
            case 'order_delivered':
                return <Package className={`${iconClass} text-emerald-600`} />;
            default:
                return <Bell className={`${iconClass} text-gray-600`} />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-red-500';
            case 'medium': return 'border-yellow-500';
            default: return 'border-gray-300';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <PiBellRingingFill className='text-yellow-400 text-2xl ' />

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-bounce ">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute -left-54 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                    {/* header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                                    </p>
                                )}
                            </div>                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="font-medium">No notifications</p>
                                <p className="text-sm mt-1">We'll notify you when something arrives</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${!notification.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        } transition-colors`}
                                >
                                    <div className="flex gap-3">
                                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                        <div className="flex-1">

                                            <div className="flex justify-between items-start">
                                                <h4 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-2 flex justify-between">
                                                <span className="text-xs text-gray-400">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                                <span>{new Date(notification.createdAt).toLocaleDateString()} </span>

                                            </p>
                                            {notification.actionRequired && !notification.isRead && (
                                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full border border-orange-200">
                                                    Action required
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200">
                            <button
                                onClick={() => {/* Navigate to full notifications page */ }}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;