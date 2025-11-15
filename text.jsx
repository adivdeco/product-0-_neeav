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

// --- Basic middleware first ---
app.use(cors(getCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Temporary in-memory session until DB is connected
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

// --- Your routes ---
app.get('/', (req, res) => {
    res.send('✅ Server is up and running');
});

app.use('/auth', authRouter);
// ... other routes

// --- Database connection with session store update ---
main()
    .then(async (mongoose) => {
        console.log('✅ Database connected successfully');

        // Now update session store to use MongoDB
        const MongoStore = require('connect-mongo');

        // Create new session middleware with MongoDB store
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

        // Replace the temporary session middleware
        app.use(persistentSessionMiddleware);

        console.log('✅ Session store updated to use MongoDB');

        // Rest of your startup code...
        server.listen(process.env.PORT, () => {
            console.log(`🚀 Server running with Socket.IO on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
        // Server will still run with in-memory sessions
        server.listen(process.env.PORT, () => {
            console.log(`🚀 Server running with in-memory sessions on port ${process.env.PORT}`);
        });
    });