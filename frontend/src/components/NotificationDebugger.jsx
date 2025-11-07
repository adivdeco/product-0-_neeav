// src/components/NotificationDebugger.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../socket';
import axiosClient from '../api/auth';

export default function NotificationDebugger() {
    const { user } = useSelector((state) => state.auth);
    const [debugInfo, setDebugInfo] = useState({
        socketConnected: false,
        socketId: null,
        registered: false,
        notifications: [],
        lastNotification: null
    });

    useEffect(() => {
        if (!user) return;

        console.log('🔍 DEBUG: Starting notification debugger for user:', user._id);

        // Check socket connection
        const checkSocket = () => {
            setDebugInfo(prev => ({
                ...prev,
                socketConnected: socket.connected,
                socketId: socket.id
            }));
        };

        // Load notifications
        const loadNotifications = async () => {
            try {
                const response = await axiosClient.get(`/notifications/${user._id}`);
                console.log('📋 DEBUG: Loaded notifications:', response.data);
                setDebugInfo(prev => ({
                    ...prev,
                    notifications: response.data || []
                }));
            } catch (error) {
                console.error('❌ DEBUG: Failed to load notifications:', error);
            }
        };

        // Socket event handlers
        const handleConnect = () => {
            console.log('✅ DEBUG: Socket connected');
            setDebugInfo(prev => ({
                ...prev,
                socketConnected: true,
                socketId: socket.id
            }));
        };

        const handleDisconnect = () => {
            console.log('❌ DEBUG: Socket disconnected');
            setDebugInfo(prev => ({
                ...prev,
                socketConnected: false,
                socketId: null
            }));
        };

        const handleUserRegistered = (data) => {
            console.log('✅ DEBUG: User registered with socket:', data);
            setDebugInfo(prev => ({
                ...prev,
                registered: true
            }));
        };

        const handleNewNotification = (notification) => {
            console.log('🔔 DEBUG: Real-time notification received:', notification);
            setDebugInfo(prev => ({
                ...prev,
                lastNotification: notification,
                notifications: [notification, ...prev.notifications]
            }));
        };

        // Set up socket listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('userRegistered', handleUserRegistered);
        socket.on('new_notification', handleNewNotification);

        // Initial setup
        checkSocket();
        loadNotifications();

        // Register user with socket
        if (socket.connected) {
            socket.emit('register', user._id);
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('userRegistered', handleUserRegistered);
            socket.off('new_notification', handleNewNotification);
        };
    }, [user]);

    if (!user) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: '#1f2937',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            zIndex: 10000,
            fontSize: '12px',
            maxWidth: '400px',
            maxHeight: '500px',
            overflow: 'auto',
            border: '1px solid #374151'
        }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '14px' }}>
                🔍 Notification Debugger
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
                <div>
                    <strong>User:</strong> {user._id}
                </div>
                <div>
                    <strong>Role:</strong> {user.role}
                </div>
                <div>
                    <strong>Socket:</strong>
                    <span style={{
                        color: debugInfo.socketConnected ? '#10b981' : '#ef4444',
                        marginLeft: '5px'
                    }}>
                        {debugInfo.socketConnected ? '✅ Connected' : '❌ Disconnected'}
                    </span>
                </div>
                <div>
                    <strong>Socket ID:</strong> {debugInfo.socketId || 'None'}
                </div>
                <div>
                    <strong>Registered:</strong>
                    <span style={{
                        color: debugInfo.registered ? '#10b981' : '#f59e0b',
                        marginLeft: '5px'
                    }}>
                        {debugInfo.registered ? '✅ Yes' : '🟡 No'}
                    </span>
                </div>
                <div>
                    <strong>Total Notifications:</strong> {debugInfo.notifications.length}
                </div>

                {debugInfo.lastNotification && (
                    <div style={{
                        background: '#374151',
                        padding: '8px',
                        borderRadius: '4px',
                        marginTop: '8px'
                    }}>
                        <strong>Last Notification:</strong>
                        <div style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                            {JSON.stringify(debugInfo.lastNotification, null, 2)}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '10px' }}>
                    <button
                        onClick={async () => {
                            try {
                                const response = await axiosClient.get(`/notifications/debug/connected-users`);
                                console.log('🔗 Connected users:', response.data);
                                alert('Check console for connected users');
                            } catch (error) {
                                console.error('Failed to get connected users:', error);
                            }
                        }}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            marginRight: '5px'
                        }}
                    >
                        Check Connected Users
                    </button>

                    <button
                        onClick={() => {
                            if (socket.connected) {
                                socket.disconnect();
                            } else {
                                socket.connect();
                            }
                        }}
                        style={{
                            background: socket.connected ? '#ef4444' : '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        {socket.connected ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
            </div>
        </div>
    );
}