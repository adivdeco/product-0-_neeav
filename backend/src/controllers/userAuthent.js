const User = require('../models/userSchema')
const bcrypt = require('bcrypt');
const validateuser = require('../utils/validators');
// const jwt = require('jsonwebtoken');
// const redisClient = require('../config/redis');



const registerUser = async (req, res) => {
    try {

        validateuser(req.body);

        const { password, email } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'User'


        const check = await User.findOne({ email })

        if (check) {
            return res.status(400).json({
                message: "Email is alredy registered , try with different email_Id"
            });
        } else {

            const user = await User.create(req.body);

            // Create session after registration
            req.session.userId = user._id;
            req.session.email = user.email;

            const reply = {
                name: user.name,
                email: user.email,
                _id: user._id,
                role: user.role,
            }

            res.status(200).json({
                user: reply,
                message: "login sussesfully",
            });

        }




    } catch (error) {
        console.error('Error in reg New User:', error);
        res.sendStatus(500).json({ message: 'Internal server error' });

    }
}


const loginUser = async (req, res) => {
    // console.log("Login attempt received");

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required",
                field: !email ? "email" : "password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log("No user found with email:", email);
            return res.status(401).json({
                success: false,
                error: "No account found with this email",
                field: "email"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log("Password comparison failed");
            return res.status(401).json({
                success: false,
                error: "Incorrect password",
                field: "password"
            });
        }

        // Create session
        req.session.userId = user._id;
        req.session.email = user.email;
        req.session.role = user.role;

        console.log('=== SESSION CREATED ===');
        console.log('Session ID:', req.sessionID);
        console.log('Session Data:', req.session);
        console.log('=======================');

        const reply = {
            name: user.name,
            email: user.email,
            _id: user._id,
            role: user.role,
            createdAt: user.createdAt,
            avatar: user.avatar || '',
        }

        // console.log("Login successful for user:", email);
        res.status(200).json({
            success: true,
            user: reply,
            message: "Login successful"
        });

    } catch (error) {
        console.error('Error in login:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: "An unexpected error occurred during login",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

const logOutUser = async (req, res) => {
    try {
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: "Could not logout"
                });
            }

            // Clear the session cookie
            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });

            res.status(200).json({
                success: true,
                message: "Logout successful"
            });
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Error: " + err.message
        });
    }
}








module.exports = { registerUser, loginUser, logOutUser, }