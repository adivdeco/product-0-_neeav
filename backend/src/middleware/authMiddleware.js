const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const NodeCache = require('node-cache');
const userCache = new NodeCache({ stdTTL: 60, useClones: false }); // Cache for 1 minute, no cloning

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Not logged in" });

        const decoded = jwt.verify(token, "secretkey");

        // Check cache first
        const cacheKey = `user_${decoded.userId}`;
        let finduser = userCache.get(cacheKey);

        if (!finduser) {
            // console.log('Cache miss for user:', decoded.userId);
            // Use .lean() to get a plain object, preventing circular reference issues with caching
            finduser = await User.findById(decoded.userId).select('-password').lean();
            if (finduser) {
                userCache.set(cacheKey, finduser);
            }
        }

        if (!finduser) {
            // console.error('User not found in DB for ID:', decoded.userId);
            return res.status(401).json({ message: "User not found", detail: `ID: ${decoded.userId}` });
        }

        req.finduser = finduser

        next();
    } catch (err) {
        // console.error('Auth middleware error details:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired", expiredAt: err.expiredAt });
        }
        res.status(401).json({ message: "Invalid token", error: err.message });
    }
};

module.exports = authMiddleware

