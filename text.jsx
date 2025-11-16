




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
const Airouter = require('./routes/aiPower')






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

        try {
            const createEmployeeRecords = require('./utils/createEmployeeRecords');
            const { cleanupOldRequests } = require('./utils/cleanupCron')

            await createEmployeeRecords();
            await cleanupOldRequests();

            console.log('✅ Employee records check completed & cleanup requist also runs.');
        } catch (error) {
            console.log('ℹ️ Employee records creation skipped or failed:', error.message);
        }

        const MongoStore = require('connect-mongo');

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

        app.use(persistentSessionMiddleware);

        console.log('✅ Session store updated to use MongoDB');

        server.listen(process.env.PORT, () => {
            console.log(`🚀 Server running with Socket.IO on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
    });

module.exports = app;



const loginUser = async (req, res) => {
    // console.log("Login attempt received");

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required",
                field: !email ? "email" : "password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log("No user found with email:", email);
            return res.status(401).json({
                success: false,
                error: "No account found with this email",
                field: "email"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log("Password comparison failed");
            return res.status(401).json({
                success: false,
                error: "Incorrect password",
                field: "password"
            });
        }

        // Create session
        req.session.userId = user._id;
        req.session.email = user.email;
        req.session.role = user.role;

        console.log('=== SESSION CREATED ===');
        console.log('Session ID:', req.session.userId);
        console.log('Session Data:', req.session.email);
        console.log('=======================');

        const reply = {
            name: user.name,
            email: user.email,
            _id: user._id,
            role: user.role,
            createdAt: user.createdAt,
            avatar: user.avatar || '',
        }

        // console.log("Login successful for user:", email);
        res.cookie("sessionID", req.session.userId)
            .status(200).json({
                success: true,
                user: reply,
                message: "Login successful",


            });

    } catch (error) {
        console.error('Error in login:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: "An unexpected error occurred during login",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}