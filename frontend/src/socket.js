
import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        // this.socket = io('https://product-0-neeav-1.onrender.com', {
        //     withCredentials: true,
        // });
        this.socket = io("https://product-0-neeav-1.onrender.com", {
            withCredentials: true,
            transports: ["websocket"],
        });


        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();