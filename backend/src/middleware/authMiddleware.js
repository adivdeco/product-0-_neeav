const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Not logged in" });

        const decoded = jwt.verify(token, "secretkey");

        const finduser = await User.findById(decoded.userId).select('-password');

        req.finduser = finduser

        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware