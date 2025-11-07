// src/components/DebugSocketConnection.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../socket';

export default function DebugSocketConnection() {
    const { user } = useSelector((state) => state.auth);
    const [socketStatus, setSocketStatus] = useState('disconnected');
    const [connectionHistory, setConnectionHistory] = useState([]);

    useEffect(() => {
        if (!user) return;

        const updateStatus = () => {
            const status = socket.connected ? 'connected' : 'disconnected';
            setSocketStatus(status);

            // Add to history
            setConnectionHistory(prev => [
                ...prev.slice(-9), // Keep last 10 entries
                {
                    time: new Date().toLocaleTimeString(),
                    status: status,
                    socketId: socket.id
                }
            ]);
        };

        // Initial status
        updateStatus();

        // Socket event listeners
        const handleConnect = () => {
            console.log('✅ Debug: Socket connected', socket.id);
            updateStatus();
        };

        const handleDisconnect = (reason) => {
            console.log('❌ Debug: Socket disconnected', reason);
            updateStatus();
        };

        const handleUserRegistered = (data) => {
            console.log('✅ Debug: User registered confirmation', data);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('userRegistered', handleUserRegistered);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('userRegistered', handleUserRegistered);
        };
    }, [user]);

    if (!user) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            zIndex: 10000,
            border: '1px solid #dee2e6',
            fontSize: '12px',
            maxWidth: '350px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            fontFamily: 'monospace'
        }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                🔌 Socket Debug - {user.role}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                    <strong>Status:</strong>
                    <span style={{
                        color: socketStatus === 'connected' ? '#28a745' : '#dc3545',
                        fontWeight: 'bold',
                        marginLeft: '4px'
                    }}>
                        {socketStatus === 'connected' ? '✅ CONNECTED' : '❌ DISCONNECTED'}
                    </span>
                </div>
                <div>
                    <strong>User ID:</strong>
                    <div style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                        {user._id}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
                <strong>Socket ID:</strong>
                <div style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                    {socket.id || 'None'}
                </div>
            </div>

            {connectionHistory.length > 0 && (
                <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '8px' }}>
                    <strong>Recent:</strong>
                    <div style={{ maxHeight: '80px', overflowY: 'auto', fontSize: '10px' }}>
                        {connectionHistory.slice().reverse().map((entry, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                color: entry.status === 'connected' ? '#28a745' : '#dc3545'
                            }}>
                                <span>{entry.time}</span>
                                <span>{entry.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '8px', marginTop: '8px' }}>
                <button
                    onClick={() => {
                        if (socket.connected) {
                            socket.disconnect();
                        } else {
                            socket.connect();
                        }
                    }}
                    style={{
                        background: socket.connected ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        width: '100%'
                    }}
                >
                    {socket.connected ? 'Disconnect' : 'Connect'}
                </button>
            </div>
        </div>
    );
}