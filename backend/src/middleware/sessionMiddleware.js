

// const sessionMiddleware = session({
//     secret: process.env.SESSION_SECRET || 'your-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
//         maxAge: 30 * 24 * 60 * 60 * 1000,
//     }
// });


const session = require('express-session');
const MongoStore = require('connect-mongo');

// 1. First define the middleware
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        collectionName: 'sessions',
        ttl: 30 * 24 * 60 * 60 // 30 days in seconds
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    }
});

// 2. Then use it
app.use(sessionMiddleware);