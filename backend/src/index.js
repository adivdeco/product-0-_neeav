// const express = require('express');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// require('dotenv').config({ quiet: true });

// const main = require('./config/db');

// // Routes
// const authRouter = require('./routes/userAuth');
// const billsRouter = require('./routes/khata');
// const ownRouter = require('./routes/useAs');
// const uploadData = require('./routes/cloudData');
// const WorkRoute = require('./routes/workRequests');
// const NotificationRouter = require('./routes/notifications');
// const employeeRouter = require('./routes/employeeRoutes');
// const Airouter = require('./routes/aiPower');
// const ProductRouter = require('./routes/Product');
// const BuyRequestRouter = require('./routes/buyRequests');


// const app = express();

// global.users = new Map();

// // -------- CORS --------
// app.use(
//     cors({
//         // origin: "https://product-2-neeav.vercel.app",
//         origin: ["http://localhost:5173", "https://product-2-neeav.vercel.app"],
//         credentials: true,
//     })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // -------- Routes --------
// app.get('/s', (req, res) => {
//     res.send('✅ JWT Server is running or server is live');
// });

// app.use('/auth', authRouter);
// app.use('/khata', billsRouter);
// app.use('/useas', ownRouter);
// app.use('/upload', uploadData);
// app.use('/api/work-requests', WorkRoute);
// app.use('/api/notifications', NotificationRouter);
// app.use('/api/employee', employeeRouter);
// app.use('/ai-build', Airouter);
// app.use('/products', ProductRouter);
// app.use('/buy-requests', BuyRequestRouter);

// // -------- Create HTTP Server + Socket.IO --------
// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         // origin: "https://product-2-neeav.vercel.app",
//         origin: ["http://localhost:5173", "https://product-2-neeav.vercel.app"],
//         methods: ['GET', 'POST'],
//         credentials: true,
//     },
// });

// // JWT middleware for socket.io
// const jwt = require('jsonwebtoken');

// io.use((socket, next) => {
//     try {
//         // Try multiple ways to get token
//         let token = socket.handshake.auth.token ||
//             socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];

//         if (!token) {
//             console.log('No token provided for socket connection');
//             return next(new Error('Authentication required'));
//         }

//         const decoded = jwt.verify(token, "secretkey");
//         socket.userId = decoded.userId;
//         console.log('Socket authenticated for user:', socket.userId);
//         next();
//     } catch (err) {
//         console.log('Socket authentication failed:', err.message);
//         next(new Error('Invalid token'));
//     }
// });

// io.on('connection', (socket) => {
//     console.log('Socket connected:', socket.id);

//     if (socket.userId) {
//         global.users.set(socket.userId.toString(), socket.id);
//         socket.join(socket.userId.toString());
//         console.log("Socket authenticated user:", socket.userId);
//         console.log('Current users map:', Array.from(global.users.entries()));
//     }

//     socket.on('disconnect', () => {
//         // Fixed: Use the correct variable name
//         if (socket.userId) {
//             global.users.delete(socket.userId.toString());
//             console.log(`User ${socket.userId} disconnected`);
//         }
//         console.log('Socket disconnected:', socket.id);
//         console.log('Remaining users:', Array.from(global.users.entries()));
//     });
// });

// // -------- Start Server --------
// main()
//     .then(() => {
//         server.listen(process.env.PORT, () => {
//             console.log(`🚀 JWT Server running on port ${process.env.PORT}`);
//         });
//     })
//     .catch((err) => {
//         console.error('❌ Database connection failed:', err);
//     });

// module.exports = app;






const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ quiet: true });

const main = require('./config/db');

// Routes
const authRouter = require('./routes/userAuth');
const billsRouter = require('./routes/khata');
const ownRouter = require('./routes/useAs');
const uploadData = require('./routes/cloudData');
const WorkRoute = require('./routes/workRequests');
const NotificationRouter = require('./routes/notifications');
const employeeRouter = require('./routes/employeeRoutes');
const Airouter = require('./routes/aiPower');
const ProductRouter = require('./routes/Product');
const BuyRequestRouter = require('./routes/buyRequests');

const app = express();

// Global variables for socket management
global.users = new Map();
global.io = null; // Will be initialized after server creation

// -------- CORS --------
app.use(
    cors({
        origin: ["http://localhost:5173", "https://product-2-neeav.vercel.app"],
        credentials: true,
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// -------- Routes --------
app.get('/', (req, res) => {
    res.send('✅ JWT Server is running or server is live');
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use('/auth', authRouter);
app.use('/khata', billsRouter);
app.use('/useas', ownRouter);
app.use('/upload', uploadData);
app.use('/api/work-requests', WorkRoute);
app.use('/api/notifications', NotificationRouter);
app.use('/api/employee', employeeRouter);
app.use('/ai-build', Airouter);
app.use('/products', ProductRouter);
app.use('/buy-requests', BuyRequestRouter);

// -------- Create HTTP Server + Socket.IO --------
const server = http.createServer(app);

// Initialize Socket.IO with enhanced configuration
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://product-2-neeav.vercel.app"],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    maxHttpBufferSize: 1e8 // 100MB
});

// Set global io instance
global.io = io;

// JWT middleware for socket.io with enhanced error handling
const jwt = require('jsonwebtoken');

// io.use((socket, next) => {
//     try {
//         console.log('🔐 Socket connection attempt from:', socket.handshake.address);

//         // Try multiple ways to get token
//         let token = socket.handshake.auth?.token;

//         // If not in auth, check cookies
//         if (!token && socket.handshake.headers.cookie) {
//             const cookies = socket.handshake.headers.cookie.split(';');
//             const tokenCookie = cookies.find(cookie =>
//                 cookie.trim().startsWith('token=')
//             );
//             if (tokenCookie) {
//                 token = tokenCookie.split('=')[1]?.trim();
//             }
//         }

//         // If still no token, check authorization header
//         if (!token && socket.handshake.headers.authorization) {
//             const authHeader = socket.handshake.headers.authorization;
//             if (authHeader.startsWith('Bearer ')) {
//                 token = authHeader.substring(7);
//             }
//         }

//         if (!token) {
//             console.log('❌ No token provided for socket connection');
//             return next(new Error('Authentication required. Please log in again.'));
//         }

//         // Verify token
//         const decoded = jwt.verify(token, "secretkey");

//         if (!decoded.userId) {
//             console.log('❌ Invalid token payload: missing userId');
//             return next(new Error('Invalid token format'));
//         }

//         socket.userId = decoded.userId;
//         socket.userRole = decoded.role;
//         socket.userEmail = decoded.email;

//         console.log('✅ Socket authenticated for user:', {
//             userId: socket.userId,
//             role: socket.userRole,
//             email: socket.userEmail
//         });

//         next();
//     } catch (error) {
//         console.error('🔐 Socket authentication error:', {
//             name: error.name,
//             message: error.message,
//             expiredAt: error.expiredAt
//         });

//         let errorMessage = 'Authentication failed';

//         if (error.name === 'TokenExpiredError') {
//             errorMessage = 'Token expired. Please log in again.';
//         } else if (error.name === 'JsonWebTokenError') {
//             errorMessage = 'Invalid token. Please log in again.';
//         }

//         next(new Error(errorMessage));
//     }
// });

// Socket connection handler

io.use((socket, next) => {
    try {
        // console.log('🔐 Socket connection attempt from:', socket.handshake.address);
        // console.log('📋 Headers:', socket.handshake.headers);
        // console.log('🔑 Auth:', socket.handshake.auth);

        let token = socket.handshake.auth?.token;

        // If not in auth, check cookies more robustly
        if (!token && socket.handshake.headers.cookie) {
            const cookies = socket.handshake.headers.cookie.split(';');
            for (let cookie of cookies) {
                const trimmed = cookie.trim();
                if (trimmed.startsWith('token=')) {
                    token = trimmed.substring(6);
                    break;
                }
            }
        }

        // If still no token, check authorization header
        if (!token && socket.handshake.headers.authorization) {
            const authHeader = socket.handshake.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        // console.log('🔍 Extracted token:', token ? 'Yes' : 'No');

        if (!token) {
            console.log('❌ No token provided for socket connection');
            return next(new Error('Authentication required'));
        }

        // Verify token
        const decoded = jwt.verify(token, "secretkey");

        if (!decoded.userId) {
            console.log('❌ Invalid token payload: missing userId');
            return next(new Error('Invalid token format'));
        }

        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userEmail = decoded.email;

        console.log('✅ Socket authenticated for user:', {
            userId: socket.userId,
            role: socket.userRole,
            email: socket.userEmail
        });

        next();
    } catch (error) {
        console.error('🔐 Socket authentication error:', error.message);

        let errorMessage = 'Authentication failed';
        if (error.name === 'TokenExpiredError') {
            errorMessage = 'Token expired';
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Invalid token';
        }

        next(new Error(errorMessage));
    }
});

io.on('connection', (socket) => {
    console.log('✅ Socket connected:', {
        socketId: socket.id,
        userId: socket.userId,
        userRole: socket.userRole,
        address: socket.handshake.address
    });

    // Store user connection
    if (socket.userId) {
        global.users.set(socket.userId.toString(), socket.id);

        // Join user-specific room for private messages
        socket.join(socket.userId.toString());

        // Join role-based rooms
        if (socket.userRole === 'store_owner') {
            socket.join('store_owners');
            console.log(`🏪 Store owner ${socket.userId} joined store_owners room`);
        } else if (socket.userRole === 'contractor') {
            socket.join('contractors');
            console.log(`👷 Contractor ${socket.userId} joined contractors room`);
        } else if (socket.userRole === 'admin' || socket.userRole === 'co-admin') {
            socket.join('admins');
            console.log(`👨‍💼 Admin ${socket.userId} joined admins room`);
        }

        // Send authentication success
        socket.emit('authenticated', {
            message: 'Successfully authenticated',
            userId: socket.userId,
            role: socket.userRole
        });

        console.log('📊 Current connected users:', global.users.size);
    }

    // Handle custom room joining
    socket.on('join_room', (roomId) => {
        if (roomId && typeof roomId === 'string') {
            socket.join(roomId);
            // console.log(`🔗 User ${socket.userId} joined room: ${roomId}`);
        }
    });

    socket.on('leave_room', (roomId) => {
        if (roomId && typeof roomId === 'string') {
            socket.leave(roomId);
            // console.log(`🚪 User ${socket.userId} left room: ${roomId}`);
        }
    });

    // Handle custom events
    socket.on('ping', (data) => {
        socket.emit('pong', {
            timestamp: new Date().toISOString(),
            data: data
        });
    });

    // Error handling
    socket.on('error', (error) => {
        console.error('❌ Socket error:', {
            socketId: socket.id,
            userId: socket.userId,
            error: error
        });
    });

    // Disconnection handler
    socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', {
            socketId: socket.id,
            userId: socket.userId,
            reason: reason
        });

        if (socket.userId) {
            global.users.delete(socket.userId.toString());
            console.log(`👤 User ${socket.userId} removed from connected users`);
        }

        console.log('📊 Remaining connected users:', global.users.size);
    });

    // Handle voluntary disconnection
    socket.on('disconnect_me', () => {
        console.log('👋 User requested disconnection:', socket.userId);
        socket.disconnect(true);
    });
});

// Socket utility functions (can be used in routes)
const socketUtils = {
    // Send notification to specific user
    sendToUser: (userId, event, data) => {
        try {
            const socketId = global.users.get(userId.toString());
            if (socketId && global.io) {
                global.io.to(socketId).emit(event, data);
                console.log(`📤 Sent ${event} to user ${userId}`);
                return true;
            } else {
                console.log(`⚠️ User ${userId} not connected for event ${event}`);
                return false;
            }
        } catch (error) {
            console.error('❌ Error sending socket message:', error);
            return false;
        }
    },

    // Send to all users in a room
    sendToRoom: (roomId, event, data) => {
        try {
            if (global.io) {
                global.io.to(roomId).emit(event, data);
                console.log(`📤 Sent ${event} to room ${roomId}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error sending to room:', error);
            return false;
        }
    },

    // Send to all connected users
    broadcast: (event, data) => {
        try {
            if (global.io) {
                global.io.emit(event, data);
                console.log(`📢 Broadcast ${event} to all users`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error broadcasting:', error);
            return false;
        }
    },

    // Check if user is connected
    isUserConnected: (userId) => {
        return global.users.has(userId.toString());
    },

    // Get connected users count
    getConnectedUsersCount: () => {
        return global.users.size;
    }
};

// Make socket utils available globally (optional)
global.socketUtils = socketUtils;

// -------- Start Server --------
const PORT = process.env.PORT || 3000;

main()
    .then(() => {
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 JWT Server running on port ${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Socket.IO enabled: ${!!global.io}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

module.exports = { app, server, socketUtils };