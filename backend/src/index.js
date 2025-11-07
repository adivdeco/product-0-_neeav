// const express = require('express');
// const session = require('express-session');
// const app = express();
// require('dotenv').config({ quiet: true });
// const main = require('./config/db')
// const cookieParser = require('cookie-parser')
// const cors = require("cors");
// const http = require('http');
// const { Server } = require('socket.io');

// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: { origin: process.env.CORS_ORIGINS, methods: ['GET', 'POST'] }
// });


// const users = new Map();

// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     socket.on('register', (userId) => {
//         users.set(userId, socket.id);
//     });

//     socket.on('disconnect', () => {
//         for (const [key, value] of users.entries()) {
//             if (value === socket.id) users.delete(key);
//         }
//     });
// });

// global.io = io;










// // Session configuration
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
//         httpOnly: true,
//         maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days expiration
//     }
// }));

// const { getCorsOptions } = require("./config/corsOptions");


// const authRouter = require('./routes/userAuth')
// const billsRouter = require('./routes/khata')
// const ownRouter = require('./routes/useAs');
// const uploadData = require('./routes/cloudData');

// app.use(cors(getCorsOptions()));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use('/auth', authRouter),
//     app.use('/khata', billsRouter)
// app.use('/useas', ownRouter) // add shop,contractor

// app.use('/upload', uploadData)

// // Debug: list registered routes under /auth to help troubleshooting
// // const listRoutes = (router, base = '') => {
// //     const routes = [];
// //     router.stack && router.stack.forEach(layer => {
// //         if (layer.route && layer.route.path) {
// //             const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
// //             routes.push(`${methods} ${base}${layer.route.path}`);
// //         } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
// //             layer.handle.stack.forEach(sub => {
// //                 if (sub.route && sub.route.path) {
// //                     const methods = Object.keys(sub.route.methods).join(',').toUpperCase();
// //                     routes.push(`${methods} ${base}${sub.route.path}`);
// //                 }
// //             });
// //         }
// //     });
// //     return routes;
// // };

// // try {
// //     const authRoutes = listRoutes(authRouter, '/auth');
// //     console.log('Auth routes:', authRoutes);
// // } catch (err) {
// //     console.warn('Could not enumerate auth routes', err);
// // }



// main().then(async () => {
//     // app.listen(process.env.PORT, () => {
//     //     console.log(`Server is running on port ${process.env.PORT}`);

//     // })
//     server.listen(process.env.PORT, () => {
//         console.log(`Server running with Socket.IO on ${process.env.PORT}`);
//     });
// })
//     .catch((err) => {
//         console.error('❌ Database connection failed:', err);
//     });

// module.exports = app;



const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ quiet: true });

const main = require('./config/db');
const { getCorsOptions } = require('./config/corsOptions');

// Routes
const authRouter = require('./routes/userAuth');
const billsRouter = require('./routes/khata');
const ownRouter = require('./routes/useAs');
const uploadData = require('./routes/cloudData');
const noticeRouter = require('./routes/notificationRoutes');
const notifyDataRouter = require('./routes/serviceRequestRoutes')

const app = express();

// --- Middleware setup ---
app.use(cors(getCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
    })
);

// --- Register routes ---
app.get('/', (req, res) => {
    res.send('✅ Server is up and running');
});
app.use('/auth', authRouter);
app.use('/khata', billsRouter);
app.use('/useas', ownRouter);
app.use('/upload', uploadData);
app.use('/notifications', noticeRouter)
app.use('/service-requests', notifyDataRouter)

// --- Create HTTP server & bind Socket.IO ---
const server = http.createServer(app);


const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGINS, methods: ['GET', 'POST'] },
});

global.users = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Register user with their ID
    socket.on('register', (userId, callback) => {
        if (!userId) {
            console.log('❌ Register: No userId provided');
            if (callback) callback({ success: false, error: 'No userId' });
            return;
        }

        // Store user ID with socket ID
        global.users.set(userId.toString(), socket.id);

        console.log(`✅ User ${userId} registered with socket ${socket.id}`);
        console.log(`📊 Total connected users: ${global.users.size}`);

        // Send confirmation to client
        if (callback) {
            callback({
                success: true,
                userId: userId,
                socketId: socket.id,
                message: 'Successfully registered for real-time notifications'
            });
        }

        // Also emit a separate event for confirmation
        socket.emit('userRegistered', {
            userId: userId,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log('User disconnected:', socket.id, 'Reason:', reason);

        // Remove from connected users
        for (let [userId, socketId] of global.users.entries()) {
            if (socketId === socket.id) {
                global.users.delete(userId);
                console.log(`🗑️ User ${userId} removed from connected users`);
                break;
            }
        }

        console.log(`📊 Remaining connected users: ${global.users.size}`);
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });
});

// make io globally available (useful in controllers)
global.io = io;

// --- Start the app ---
main()
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log(`🚀 Server running with Socket.IO on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
    });

module.exports = app;
