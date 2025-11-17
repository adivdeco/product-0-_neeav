const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Not logged in" });

        const payload = jwt.verify(token, "secretkey");

        const { userId, role } = payload;
        if (!userId || role !== 'co-admin' && role !== "admin") {
            return res.status(403).send("Forbidden: You do not have admin access")
        }

        const finduser = await User.findById(payload.userId).select('-password');

        req.finduser = finduser

        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = adminMiddleware



