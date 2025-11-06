// src/components/SocketDebugger.jsx
import { useEffect, useState } from 'react';
import { socket } from '../socket';

export default function SocketDebugger({ userId }) {
    const [socketStatus, setSocketStatus] = useState('disconnected');
    const [lastNotification, setLastNotification] = useState(null);

    useEffect(() => {
        if (!userId) return;

        console.log('🔌 SocketDebugger: Setting up socket for user:', userId);

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            setSocketStatus('connected');
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setSocketStatus('disconnected');
        });

        socket.on('new_notification', (data) => {
            console.log('🔔 REAL-TIME: Socket notification received:', data);
            setLastNotification(data);
        });

        // Connect socket
        socket.auth = { userId };
        socket.connect();
        socket.emit('register', userId);

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('new_notification');
        };
    }, [userId]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            background: socketStatus === 'connected' ? '#d4edda' : '#f8d7da',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 1000,
            maxWidth: '300px'
        }}>
            <strong>Socket Status: {socketStatus}</strong>
            {lastNotification && (
                <div style={{ marginTop: '5px' }}>
                    <div>📨 Last Notification:</div>
                    <div><strong>{lastNotification.title}</strong></div>
                    <div>{lastNotification.message}</div>
                </div>
            )}
        </div>
    );
}