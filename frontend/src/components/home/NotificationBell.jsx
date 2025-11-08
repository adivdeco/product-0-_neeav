// components/NotificationBell.jsx
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAsRead, markAllAsRead } from '../../redux/slice/notificationSlice';

const NotificationBell = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector((state) => state.notifications);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        dispatch(getNotifications({ page: 1, unreadOnly: false }));
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

    const handleMarkAsRead = async (notificationId) => {
        await dispatch(markAsRead(notificationId));
    };

    const handleMarkAllAsRead = async () => {
        await dispatch(markAllAsRead());
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'work_request': return '📋';
            case 'request_accepted': return '✅';
            case 'request_rejected': return '❌';
            case 'work_completed': return '🎉';
            default: return '🔔';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-red-500';
            case 'medium': return 'border-yellow-500';
            default: return 'border-gray-300';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
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
                            <div className="p-4 text-center text-gray-500">
                                No notifications
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
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </p>
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