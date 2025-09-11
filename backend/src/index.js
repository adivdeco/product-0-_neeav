const express = require('express');
const session = require('express-session');
const app = express();
require('dotenv').config({ quiet: true });
const main = require('./config/db')
const cookieParser = require('cookie-parser')


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

const authRouter = require('./routes/userAuth')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRouter)



main().then(async () => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);

    })
})

module.exports = app;