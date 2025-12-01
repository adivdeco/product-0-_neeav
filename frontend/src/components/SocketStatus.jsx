// components/DebugButton.jsx (temporary)
import { useSelector } from 'react-redux';
import SocketService from '../utils/socket';

const DebugButton = () => {
    const { user, isAuthenticated, token } = useSelector((state) => state.auth);

    const handleDebug = () => {
        console.log('🐛 DEBUG INFO:');
        console.log('User:', user);
        console.log('Is Authenticated:', isAuthenticated);
        console.log('Token in Redux:', token);
        console.log('Socket Connected:', SocketService.getConnectionStatus());

        // Test token retrieval
        const foundToken = SocketService.getToken();
        console.log('Token found by SocketService:', foundToken);

        // Manual connect attempt
        SocketService.connect();
    };

    const handleTestPing = () => {
        SocketService.testConnection();
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
            <button
                onClick={handleDebug}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
            >
                Debug Socket
            </button>
            <button
                onClick={handleTestPing}
                className="px-3 py-2 bg-green-600 text-white rounded text-sm"
            >
                Test Ping
            </button>
        </div>
    );
};

export default DebugButton;