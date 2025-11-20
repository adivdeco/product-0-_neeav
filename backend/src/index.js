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


const app = express();

global.users = new Map();

// -------- CORS --------
app.use(
    cors({
        // origin: "https://product-2-neeav.vercel.app",
        origin: ["http://localhost:5173", "https://product-2-neeav.vercel.app"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------- Routes --------
app.get('/s', (req, res) => {
    res.send('✅ JWT Server is running or server is live');
});

app.use('/auth', authRouter);
app.use('/khata', billsRouter);
app.use('/useas', ownRouter);
app.use('/upload', uploadData);
app.use('/api/work-requests', WorkRoute);
app.use('/api/notifications', NotificationRouter);
app.use('/api/employee', employeeRouter);
app.use('/ai-build', Airouter);
app.use('/products', ProductRouter)

// -------- Create HTTP Server + Socket.IO --------
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        // origin: "https://product-2-neeav.vercel.app",
        origin: ["http://localhost:5173", "https://product-2-neeav.vercel.app"],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// JWT middleware for socket.io
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
    try {
        // Try multiple ways to get token
        let token = socket.handshake.auth.token ||
            socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];

        if (!token) {
            console.log('No token provided for socket connection');
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, "secretkey");
        socket.userId = decoded.userId;
        console.log('Socket authenticated for user:', socket.userId);
        next();
    } catch (err) {
        console.log('Socket authentication failed:', err.message);
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    if (socket.userId) {
        global.users.set(socket.userId.toString(), socket.id);
        socket.join(socket.userId.toString());
        console.log("Socket authenticated user:", socket.userId);
        console.log('Current users map:', Array.from(global.users.entries()));
    }

    socket.on('disconnect', () => {
        // Fixed: Use the correct variable name
        if (socket.userId) {
            global.users.delete(socket.userId.toString());
            console.log(`User ${socket.userId} disconnected`);
        }
        console.log('Socket disconnected:', socket.id);
        console.log('Remaining users:', Array.from(global.users.entries()));
    });
});

// -------- Start Server --------
main()
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log(`🚀 JWT Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
    });

module.exports = app;
