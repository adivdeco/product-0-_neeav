// hooks/useSocket.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import SocketService from '../utils/socket';

export const useSocket = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('🔌 Connecting socket for user:', user._id);
            SocketService.connect();
        } else {
            console.log('🔌 Disconnecting socket - no authenticated user');
            SocketService.disconnect();
        }

        // Cleanup on component unmount
        return () => {
            // Note: We don't disconnect here to maintain connection across route changes
            // SocketService.disconnect();
        };
    }, [isAuthenticated, user]);

    return SocketService;
};