// components/SocketDebug.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SocketService from '../utils/socket';

const SocketDebug = () => {
    const [socketStatus, setSocketStatus] = useState('disconnected');
    const [logs, setLogs] = useState([]);
    const { isAuthenticated, user } = useSelector(state => state.auth);

    const addLog = (message) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setSocketStatus('disconnected');
            addLog('User not authenticated');
            return;
        }

        // Check connection status every second
        const interval = setInterval(() => {
            const status = SocketService.getConnectionStatus() ? 'connected' : 'disconnected';
            setSocketStatus(status);
        }, 1000);

        // Listen for socket events
        const handleConnect = () => {
            setSocketStatus('connected');
            addLog('✅ Socket connected');
        };

        const handleDisconnect = () => {
            setSocketStatus('disconnected');
            addLog('❌ Socket disconnected');
        };

        const handleConnectError = (error) => {
            addLog(`🔌 Connection error: ${error.message}`);
        };

        const handleAuthenticated = (data) => {
            addLog(`🔓 Authenticated: ${JSON.stringify(data)}`);
        };

        // Add event listeners
        if (SocketService.socket) {
            SocketService.socket.on('connect', handleConnect);
            SocketService.socket.on('disconnect', handleDisconnect);
            SocketService.socket.on('connect_error', handleConnectError);
            SocketService.socket.on('authenticated', handleAuthenticated);
        }

        return () => {
            clearInterval(interval);
            if (SocketService.socket) {
                SocketService.socket.off('connect', handleConnect);
                SocketService.socket.off('disconnect', handleDisconnect);
                SocketService.socket.off('connect_error', handleConnectError);
                SocketService.socket.off('authenticated', handleAuthenticated);
            }
        };
    }, [isAuthenticated, user]);

    const handleConnect = () => {
        addLog('🔄 Manual connection attempt...');
        SocketService.connect();
    };

    const handleDisconnect = () => {
        addLog('🔌 Manual disconnect...');
        SocketService.disconnect();
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md max-h-96 overflow-auto">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Socket Debug</h3>
                <div className={`w-3 h-3 rounded-full ${socketStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
            </div>

            <div className="text-xs mb-2">
                Status: <span className={socketStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
                    {socketStatus.toUpperCase()}
                </span>
            </div>

            <div className="flex gap-2 mb-2">
                <button
                    onClick={handleConnect}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                >
                    Connect
                </button>
                <button
                    onClick={handleDisconnect}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                >
                    Disconnect
                </button>
                <button
                    onClick={() => setLogs([])}
                    className="px-2 py-1 bg-gray-600 text-white rounded text-xs"
                >
                    Clear Logs
                </button>
            </div>

            <div className="text-xs font-mono">
                {logs.slice(-10).map((log, index) => (
                    <div key={index} className="border-b border-gray-600 py-1">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SocketDebug;