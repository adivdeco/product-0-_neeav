
// import { useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import SocketService from '../utils/socket';

// export const useSocket = () => {
//     const { user, isAuthenticated } = useSelector(state => state.auth);

//     useEffect(() => {
//         if (isAuthenticated && user && SocketService.isAuthenticated()) {
//             console.log('🔌 Connecting socket for user:', user._id);
//             SocketService.connect();
//         } else {
//             console.log('🔌 Disconnecting socket - no authenticated user');
//             SocketService.disconnect();
//         }

//         return () => {
//             // Don't disconnect here - let it manage connection across route changes
//             // Only disconnect when user logs out or token becomes invalid
//         };
//     }, [isAuthenticated, user]);

//     return SocketService;
// };

// hooks/useSocket.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import SocketService from '../utils/socket';

export const useSocket = () => {
    const { user, isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        // Only connect if authenticated and user data is available
        if (isAuthenticated && user && user._id) {
            console.log('🔌 useSocket: Connecting socket for user:', user._id);

            // Small delay to ensure token is set in cookies
            const timer = setTimeout(() => {
                SocketService.connect();
            }, 500);

            return () => {
                clearTimeout(timer);
                // Don't disconnect here - let SocketService manage connection
            };
        } else {
            console.log('🔌 useSocket: Disconnecting - not authenticated');
            SocketService.disconnect();
        }
    }, [isAuthenticated, user]);

    return SocketService;
};