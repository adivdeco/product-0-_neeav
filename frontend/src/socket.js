// // src/socket.js
// import { io } from "socket.io-client";

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
// export  const socket = io(SOCKET_URL, {
//     autoConnect: true,//false that phle
//     transports: ["websocket", "polling"]
// });

// utils/socket.js
import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io('http://localhost:3000', {
            withCredentials: true,
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