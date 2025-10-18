const express = require('express');
// const User = require('../models/userSchema.js')
const { registerUser, loginUser, logOutUser } = require('../controllers/userAuthent.js');
const User = require('../models/userSchema.js');

const authRouter = express.Router();


authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/logout', logOutUser)



authRouter.get('/check-session', async (req, res) => {
    if (req.session && req.session.userId) {
        const user = await User.findById(req.session.userId).select("-password");
        return res.json({ success: true, isLoggedIn: true, user });
    } else {
        return res.json({ success: true, isLoggedIn: false });
    }
});


module.exports = authRouter;
