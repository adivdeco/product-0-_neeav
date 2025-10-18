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
const ownRouter = require('./routes/useAs')

app.use(cors(getCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRouter),
    app.use('/khata', billsRouter)
app.use('/useas', ownRouter) // add shop,contractor



main().then(async () => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);

    })
})

module.exports = app;