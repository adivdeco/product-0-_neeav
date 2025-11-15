const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ quiet: true });

const main = require('./config/db');
const { getCorsOptions } = require('./config/corsOptions');
// In server.js, after database connection
require('./utils/autoAssignCron');
console.log('Auto-assignment cron job initialized');

// Routes
const authRouter = require('./routes/userAuth');
const billsRouter = require('./routes/khata');
const ownRouter = require('./routes/useAs');
const uploadData = require('./routes/cloudData');
const WorkRoute = require('./routes/workRequests');
const NotificationRouter = require('./routes/notifications');
const employeeRouter = require('./routes/employeeRoutes');
const Airouter = require('./routes/aiPower')

const app = express();

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',   // needs HTTPS
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    }

});

// --- Middleware setup ---
app.use(cors(getCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);



// --- Register routes ---
app.get('/', (req, res) => {
    res.send('✅ Server is up and running');
});
app.use('/auth', authRouter);
app.use('/khata', billsRouter);
app.use('/useas', ownRouter);
app.use('/upload', uploadData);
app.use('/api/work-requests', WorkRoute);
app.use('/api/notifications', NotificationRouter);
app.use('/api/employee', employeeRouter);
app.use('/ai-build', Airouter)


// --- Create HTTP server & bind Socket.IO ---
const server = http.createServer(app);
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

global.users = new Map();
global.io = io;

// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     socket.on('register', (userId) => {
//         if (!userId) return;
//         global.users.set(userId, socket.id);
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//     });

//     socket.on('disconnect', () => {
//         for (const [key, value] of global.users.entries()) {
//             if (value === socket.id) global.users.delete(key);
//         }
//         console.log('User disconnected:', socket.id);
//     });
// });

// global.io = io;

// --- Start the app ---

// Add session middleware to Socket.io

// After session setup, store the middleware

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Get user ID from session
    const userId = socket.request.session?.userId;
    console.log('Session userId:', userId);

    if (userId) {
        global.users.set(userId.toString(), socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);

        // Join user to their personal room
        socket.join(userId.toString());
    }

    socket.on('disconnect', () => {
        if (userId) {
            global.users.delete(userId.toString());
        }
        console.log('User disconnected:', socket.id);
    });
});

// main()
//     .then(() => {
//         server.listen(process.env.PORT, () => {
//             console.log(`🚀 Server running with Socket.IO on port ${process.env.PORT}`);
//         });
//     })
//     .catch((err) => {
//         console.error('❌ Database connection failed:', err);
//     });
// Add this right after your database connection in server.js

main()
    .then(async () => {
        // Auto-create employee records for existing admins
        try {
            const createEmployeeRecords = require('./utils/createEmployeeRecords');
            const { cleanupOldRequests } = require('./utils/cleanupCron')

            await createEmployeeRecords();
            await cleanupOldRequests();

            console.log('✅ Employee records check completed & cleanup requist also runs.');
        } catch (error) {
            console.log('ℹ️ Employee records creation skipped or failed:', error.message);
        }

        server.listen(process.env.PORT, () => {
            console.log(`🚀 Server running with Socket.IO on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
    });

module.exports = app;
