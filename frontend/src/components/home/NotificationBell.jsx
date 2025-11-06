

// NotificationBell.jsx - WITH DEBUG INFO
import React, { useState } from "react";

export default function NotificationBell({ notifications, loading }) {
    const [open, setOpen] = useState(false);
    const unread = notifications?.filter(n => !n.isRead).length || 0;

    console.log("🔔 NotificationBell: unread=", unread, "total=", notifications?.length);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-full hover:bg-gray-100 relative"
                disabled={loading}
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path d="M12 22c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2zM18 16v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                        </svg>
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 min-w-[18px] text-center">
                                {unread}
                            </span>
                        )}
                    </>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-3 border-b">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Notifications</span>
                            {loading && <span className="text-xs text-blue-500">Loading...</span>}
                        </div>
                    </div>
                    <div className="p-2 max-h-96 overflow-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500 text-center">
                                {loading ? "Loading..." : "No notifications"}
                            </div>
                        ) : notifications.map((n, i) => (
                            <div key={i} className={`p-3 border-b last:border-b-0 hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                                <div className="text-sm font-semibold">{n.title || 'Notification'}</div>
                                <div className="text-xs text-gray-600">{n.message || n?.body}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(n.createdAt || Date.now()).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}