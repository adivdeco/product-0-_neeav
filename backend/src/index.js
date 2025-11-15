const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ quiet: true });

const main = require('./config/db');
const { getCorsOptions } = require('./config/corsOptions');

const app = express();

// --- Middleware setup ---
app.use(cors(getCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Temporary in-memory session for initial setup
let sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    }
});

app.use(sessionMiddleware);

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
const Airouter = require('./routes/aiPower');

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
app.use('/ai-build', Airouter);

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

// Use the current session middleware for Socket.io
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

// Database connection and server startup
main()
    .then(async (mongoose) => { // mongoose is passed from main()
        console.log('✅ Database connected successfully');

        try {
            const createEmployeeRecords = require('./utils/createEmployeeRecords');
            const { cleanupOldRequests } = require('./utils/cleanupCron');

            await createEmployeeRecords();
            await cleanupOldRequests();

            console.log('✅ Employee records check completed & cleanup requests also run.');
        } catch (error) {
            console.log('ℹ️ Employee records creation skipped or failed:', error.message);
        }

        // Create persistent session middleware with MongoDB store
        const persistentSessionMiddleware = session({
            secret: process.env.SESSION_SECRET || 'your-secret-key',
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                client: mongoose.connection.getClient(), // Use existing connection
                collectionName: 'sessions',
                ttl: 30 * 24 * 60 * 60
            }),
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            }
        });

        // Replace the session middleware in the app
        // Remove the old session middleware and add the new one
        app._router.stack.forEach((middleware, index) => {
            if (middleware.handle === sessionMiddleware) {
                app._router.stack[index].handle = persistentSessionMiddleware;
            }
        });

        // Also update the sessionMiddleware variable for Socket.io
        sessionMiddleware = persistentSessionMiddleware;

        console.log('✅ Session store updated to use MongoDB');

        server.listen(process.env.PORT, () => {
            console.log(`🚀 Server running with Socket.IO on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
        // Fallback: start server with in-memory sessions
        server.listen(process.env.PORT, () => {
            console.log(`🚀 Server running with in-memory sessions on port ${process.env.PORT}`);
        });
    });

module.exports = app;