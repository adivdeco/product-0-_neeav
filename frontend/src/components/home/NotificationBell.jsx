// components/NotificationBell.jsx - FIXED
import React, { useState, useEffect } from "react";
import axiosClient from "../../api/auth";

export default function NotificationBell({ notifications }) {
    const [open, setOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const [enhancedNotifications, setEnhancedNotifications] = useState([]);

    console.log("🔔 Raw notifications from hook:", notifications);

    // Enhance notifications with service request data
    useEffect(() => {
        const enhanceNotifications = async () => {
            console.log("🔄 Enhancing notifications with service request data...");

            const enhanced = await Promise.all(
                notifications.map(async (notification) => {
                    console.log("📋 Processing notification:", {
                        id: notification._id,
                        type: notification.type,
                        hasData: !!notification.data,
                        data: notification.data
                    });

                    // If it's a service request and has serviceRequestId, fetch the details
                    if (notification.type === "service_request" && notification.data?.serviceRequestId) {
                        try {
                            console.log("📡 Fetching service request:", notification.data.serviceRequestId);
                            const response = await axiosClient.get(`/service-requests/${notification.data.serviceRequestId}`);
                            console.log("✅ Service request data:", response.data);
                            return {
                                ...notification,
                                serviceRequest: response.data.serviceRequest
                            };
                        } catch (error) {
                            console.error("❌ Error fetching service request:", error);
                            // Return notification without service request data
                            return notification;
                        }
                    }
                    // For service requests without serviceRequestId, try to get from contractor endpoint
                    else if (notification.type === "service_request") {
                        try {
                            console.log("🔄 Trying to fetch service requests for contractor...");
                            const response = await axiosClient.get(`/service-requests/contractor/${notification.receiverId}`);
                            if (response.data.serviceRequests && response.data.serviceRequests.length > 0) {
                                // Find matching service request by customer name or other identifier
                                const matchingRequest = response.data.serviceRequests.find(req =>
                                    req.customerName === notification.title?.replace('New Quote Request from ', '')
                                );
                                if (matchingRequest) {
                                    return {
                                        ...notification,
                                        serviceRequest: matchingRequest
                                    };
                                }
                            }
                        } catch (error) {
                            console.error("❌ Error fetching contractor service requests:", error);
                        }
                    }
                    return notification;
                })
            );

            console.log("✅ Enhanced notifications:", enhanced);
            setEnhancedNotifications(enhanced);
        };

        if (notifications.length > 0) {
            enhanceNotifications();
        } else {
            setEnhancedNotifications([]);
        }
    }, [notifications]);

    const serviceRequests = enhancedNotifications.filter(n => n.type === "service_request");
    const otherNotifications = enhancedNotifications.filter(n => n.type !== "service_request");

    const unread = enhancedNotifications.filter(n => !n.isRead).length;
    const pendingRequests = serviceRequests.filter(req =>
        req.serviceRequest?.status === 'pending' || req.status === 'pending'
    ).length;

    console.log("📊 Notification Stats:", {
        total: enhancedNotifications.length,
        serviceRequests: serviceRequests.length,
        other: otherNotifications.length,
        unread,
        pendingRequests
    });

    const handleRequestAction = async (notificationId, serviceRequestId, action) => {
        setLoadingAction(serviceRequestId);
        try {
            console.log(`🔄 ${action} request:`, serviceRequestId);

            // Update service request status
            const updateResponse = await axiosClient.patch(`/service-requests/${serviceRequestId}`, {
                status: action,
                actionTakenAt: new Date().toISOString()
            });

            console.log("✅ Service request updated:", updateResponse.data);

            // Mark notification as read
            await axiosClient.patch(`/notifications/${notificationId}/read`);

            // Update local state
            setEnhancedNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId
                        ? {
                            ...notif,
                            isRead: true,
                            serviceRequest: notif.serviceRequest ? {
                                ...notif.serviceRequest,
                                status: action,
                                actionTakenAt: new Date().toISOString()
                            } : notif.serviceRequest
                        }
                        : notif
                )
            );

            console.log(`✅ Request ${action} successfully`);

        } catch (error) {
            console.error(`❌ Failed to ${action} request:`, error);
            alert(`Failed to ${action} request. Please try again.`);
        } finally {
            setLoadingAction(null);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axiosClient.patch(`/notifications/${notificationId}/read`);
            setEnhancedNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', text: '⏳ Pending' },
            'accepted': { color: 'bg-green-100 text-green-800 border border-green-200', text: '✅ Accepted' },
            'rejected': { color: 'bg-red-100 text-red-800 border border-red-200', text: '❌ Rejected' },
            'completed': { color: 'bg-blue-100 text-blue-800 border border-blue-200', text: '🎉 Completed' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative">
            <button
                onClick={() => {
                    console.log("🔔 Opening notifications panel");
                    console.log("📋 Current enhanced notifications:", enhancedNotifications);
                    setOpen(!open);
                }}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
            >
                <svg className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>

                {(unread > 0 || pendingRequests > 0) && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-medium border-2 border-white">
                        {unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                            <div className="flex gap-2 text-xs">
                                {pendingRequests > 0 && (
                                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full font-medium">
                                        {pendingRequests} pending
                                    </span>
                                )}
                                <span className="bg-gray-500 text-white px-2 py-1 rounded-full font-medium">
                                    {enhancedNotifications.length} total
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {enhancedNotifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-4xl mb-3">🔔</div>
                                <p className="text-gray-600">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {/* Service Requests */}
                                {serviceRequests.length > 0 && serviceRequests.map((notification) => {
                                    const serviceRequest = notification.serviceRequest;
                                    const isPending = (serviceRequest?.status === 'pending') || (!serviceRequest && notification.type === 'service_request');

                                    return (
                                        <div key={notification._id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                            {serviceRequest?.customerName?.charAt(0) || 'C'}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">
                                                                {serviceRequest?.customerName || 'Customer'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {serviceRequest?.customerPhone || 'No phone'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="ml-10">
                                                        <p className="text-sm text-gray-800 font-semibold mb-1">
                                                            🛠️ {serviceRequest?.projectType || 'Service Request'}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {serviceRequest?.workDescription || notification.message}
                                                        </p>

                                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                                            <span>📅 {serviceRequest?.timeline || 'Not specified'}</span>
                                                            <span>📍 {serviceRequest?.address?.split(',')[0] || 'Location not specified'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    {getStatusBadge(serviceRequest?.status || 'pending')}
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {isPending && serviceRequest && (
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                                    <button
                                                        onClick={() => handleRequestAction(
                                                            notification._id,
                                                            serviceRequest._id,
                                                            'accepted'
                                                        )}
                                                        disabled={loadingAction === serviceRequest._id}
                                                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                                                    >
                                                        {loadingAction === serviceRequest._id ? '...' : '✅ Accept'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequestAction(
                                                            notification._id,
                                                            serviceRequest._id,
                                                            'rejected'
                                                        )}
                                                        disabled={loadingAction === serviceRequest._id}
                                                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
                                                    >
                                                        {loadingAction === serviceRequest._id ? '...' : '❌ Reject'}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Show message if no service request data */}
                                            {!serviceRequest && (
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                    <p className="text-xs text-yellow-600">
                                                        ⚠️ Service request details not available
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Other Notifications */}
                                {otherNotifications.length > 0 && otherNotifications.map((notification) => (
                                    <div key={notification._id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-sm mb-1">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatTimeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span className="capitalize">{notification.type}</span>
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Mark read
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {enhancedNotifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setOpen(false)}
                                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium py-2"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}