
// const Notification = require("../models/notification");
// const admin = require("../config/firebaseAdmin");

// const createNotification = async (req, res) => {
//     try {
//         const { senderId, receiverId, title, message, type } = req.body;

//         const notification = await Notification.create({
//             senderId,
//             receiverId,
//             title,
//             message,
//             type,
//         });

//         // 1️⃣ Send live notification if user is online (Socket.IO)
//         const socketId = global.users?.get(receiverId);
//         if (socketId) {
//             global.io.to(socketId).emit("new_notification", notification);
//             console.log("🔔 Real-time notification sent to:", receiverId);
//         }

//         // 2️⃣ Send Firebase Push Notification (background)
//         const receiverToken = await getUserFcmToken(receiverId);
//         if (receiverToken) {
//             await admin.messaging().send({
//                 token: receiverToken,
//                 notification: {
//                     title: title,
//                     body: message,
//                 },
//                 data: { type },
//             });
//             console.log("📱 Push notification sent to:", receiverId);
//         }

//         res.status(201).json({ success: true, notification });
//     } catch (error) {
//         console.error("Error creating notification:", error);
//         res.status(500).json({ success: false, error: "Server error" });
//     }
// };

// // helper: fetch user's FCM token (store it in User model)
// const User = require("../models/userSchema");

// const getUserFcmToken = async (req, res) => {

//     const userId = req.session.userId;
//     const { token } = req.body

//     const user = await User.findByIdAndUpdate({ userId }, token);
//     return user?.fcmToken || null;
// }


// module.exports = { getUserFcmToken, createNotification }

const Notification = require("../models/notification");
const admin = require("../config/firebaseAdmin");
const User = require("../models/userSchema"); // adjust path

// Helper to fetch token by userId (not an express handler)
async function getUserFcmTokenById(userId) {
    const user = await User.findById(userId).select("fcmToken");
    return user?.fcmToken || null;
}

// Express handler: save FCM token
async function saveFcmToken(req, res) {
    try {
        const { userId, token } = req.body;
        if (!userId || !token) return res.status(400).json({ message: "Missing userId or token" });

        await User.findByIdAndUpdate(userId, { fcmToken: token }, { new: true });
        return res.json({ success: true });
    } catch (err) {
        console.error("saveFcmToken error", err);
        return res.status(500).json({ success: false });
    }
}

// Express handler: create notification and send both socket + FCM
async function createNotification(req, res) {
    try {
        const { senderId, receiverId, title, message, type = "system" } = req.body;
        if (!senderId || !receiverId || !title || !message) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const notification = await Notification.create({ senderId, receiverId, title, message, type });

        // Socket.IO send if online
        const socketId = global.users?.get(receiverId.toString());
        if (socketId && global.io) {
            global.io.to(socketId).emit("new_notification", notification);
            console.log("🔔 Real-time notification sent to:", receiverId);
        }

        // FCM push
        const receiverToken = await getUserFcmTokenById(receiverId);
        if (receiverToken) {
            await admin.messaging().send({
                token: receiverToken,
                notification: { title, body: message },
                data: { type },
            });
            console.log("📱 Push notification sent to:", receiverId);
        }

        return res.status(201).json({ success: true, notification });
    } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

// In notificationController.js
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ receiverId: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('senderId', 'name email'); // optional: get sender info

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

module.exports = {
    createNotification,
    saveFcmToken,
    getUserNotifications,
    getUserFcmTokenById, // export for tests / usage if needed
};
