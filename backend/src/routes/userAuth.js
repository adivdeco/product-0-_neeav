const express = require('express');
// const User = require('../models/userSchema.js')
const { registerUser, loginUser, logOutUser } = require('../controllers/userAuthent.js')

const authRouter = express.Router();


authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/logout', logOutUser)

authRouter.get('/check-session', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            success: true,
            isLoggedIn: true,
            userId: req.session.userId
        });
    } else {
        res.json({
            success: true,
            isLoggedIn: false
        });
    }
});

module.exports = authRouter;
