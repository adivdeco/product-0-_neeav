const express = require('express');
const session = require('express-session');
const app = express();
require('dotenv').config({ quiet: true });
const main = require('./config/db')
const cookieParser = require('cookie-parser')
const cors = require("cors");


// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days expiration
    }
}));

const { getCorsOptions } = require("./config/corsOptions");


const authRouter = require('./routes/userAuth')
const billsRouter = require('./routes/khata')
const ownRouter = require('./routes/useAs');
const uploadData = require('./routes/cloudData');

app.use(cors(getCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRouter),
    app.use('/khata', billsRouter)
app.use('/useas', ownRouter) // add shop,contractor

app.use('/upload', uploadData)

// Debug: list registered routes under /auth to help troubleshooting
// const listRoutes = (router, base = '') => {
//     const routes = [];
//     router.stack && router.stack.forEach(layer => {
//         if (layer.route && layer.route.path) {
//             const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
//             routes.push(`${methods} ${base}${layer.route.path}`);
//         } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
//             layer.handle.stack.forEach(sub => {
//                 if (sub.route && sub.route.path) {
//                     const methods = Object.keys(sub.route.methods).join(',').toUpperCase();
//                     routes.push(`${methods} ${base}${sub.route.path}`);
//                 }
//             });
//         }
//     });
//     return routes;
// };

// try {
//     const authRoutes = listRoutes(authRouter, '/auth');
//     console.log('Auth routes:', authRoutes);
// } catch (err) {
//     console.warn('Could not enumerate auth routes', err);
// }



main().then(async () => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);

    })
})

module.exports = app;