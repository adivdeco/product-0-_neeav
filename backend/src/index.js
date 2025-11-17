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

const app = express();

// -------- CORS --------
app.use(
    cors({
        origin: "https://product-2-neeav.vercel.app",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------- Routes --------
app.get('/', (req, res) => {
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

// -------- Create HTTP Server + Socket.IO --------
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://product-2-neeav.vercel.app",
        credentials: true,
    },
});

// JWT middleware for socket.io
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
    const token = socket.handshake.headers.cookie?.split('token=')[1];
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next();
    }
});

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    if (socket.userId) {
        socket.join(socket.userId.toString());
        console.log("Socket authenticated user:", socket.userId);
    }

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
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
