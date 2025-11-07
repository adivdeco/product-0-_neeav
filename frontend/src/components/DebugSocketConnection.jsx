// src/components/DebugSocketConnection.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../socket';

export default function DebugSocketConnection() {
    const { user } = useSelector((state) => state.auth);
    const [socketStatus, setSocketStatus] = useState('disconnected');
    const [connectedUsers, setConnectedUsers] = useState([]);

    useEffect(() => {
        if (!user) return;

        console.log(`🔍 DEBUG: User ${user._id} (${user.role}) setting up socket`);

        const onConnect = () => {
            console.log('✅ DEBUG: Socket connected', socket.id);
            setSocketStatus('connected');

            // Register user
            socket.emit('register', user._id, (response) => {
                console.log('📝 DEBUG: Registration response:', response);
            });
        };

        const onDisconnect = () => {
            console.log('❌ DEBUG: Socket disconnected');
            setSocketStatus('disconnected');
        };

        const onUserRegistered = (data) => {
            console.log('✅ DEBUG: User registered confirmation:', data);
        };

        const onNewNotification = (notification) => {
            console.log('🔔 DEBUG: Received real-time notification:', notification);
        };

        // Socket event listeners
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('userRegistered', onUserRegistered);
        socket.on('new_notification', onNewNotification);

        // Connect if not connected
        if (!socket.connected) {
            console.log('🔄 DEBUG: Manually connecting socket...');
            socket.connect();
        } else {
            console.log('✅ DEBUG: Socket already connected, re-registering...');
            socket.emit('register', user._id);
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('userRegistered', onUserRegistered);
            socket.off('new_notification', onNewNotification);
        };
    }, [user]);

    return (
        <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: '#f0f0f0',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
            border: '1px solid #ccc',
            fontSize: '12px',
            maxWidth: '300px'
        }}>
            <div><strong>Socket Debug</strong></div>
            <div>Status: <span style={{
                color: socketStatus === 'connected' ? 'green' : 'red',
                fontWeight: 'bold'
            }}>{socketStatus}</span></div>
            <div>User: {user?._id}</div>
            <div>Role: {user?.role}</div>
            <div>Socket ID: {socket.id || 'None'}</div>
        </div>
    );
}