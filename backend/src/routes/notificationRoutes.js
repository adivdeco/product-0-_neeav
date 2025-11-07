// routes/notificationRoutes.js - FIXED
const express = require("express");
const noticeRouter = express.Router();
const Notification = require("../models/Notification"); // ADD THIS IMPORT
const {
    createNotification,
    updateUserFcmToken,
    getUserNotifications,
    debugUserNotifications,
    debugConnectedUsers,
} = require("../controllers/notificationController");

noticeRouter.post("/send", createNotification);
noticeRouter.post("/notiUpdate", updateUserFcmToken);
noticeRouter.get("/:userId", getUserNotifications);
noticeRouter.get("/debug/connected-users", debugConnectedUsers);

// In routes/notificationRoutes.js - ADD THESE ENDPOINTS

// Debug endpoint to check connected users
noticeRouter.get("/debug/connected-users", (req, res) => {
    const connectedUsers = Array.from(global.users.entries()).map(([userId, socketId]) => ({
        userId,
        socketId
    }));

    console.log('🔗 DEBUG: Connected users:', connectedUsers);

    res.json({
        totalConnected: global.users.size,
        connectedUsers,
        timestamp: new Date().toISOString()
    });
});

// Debug endpoint to check if a specific user is connected
noticeRouter.get("/debug/user/:userId/connection", (req, res) => {
    const { userId } = req.params;
    const socketId = global.users.get(userId);

    console.log(`🔗 DEBUG: Checking connection for user ${userId}:`, {
        isConnected: !!socketId,
        socketId: socketId
    });

    res.json({
        userId,
        isConnected: !!socketId,
        socketId: socketId,
        totalConnectedUsers: global.users.size
    });
});

// Test notification endpoint
noticeRouter.post("/debug/send-test", async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        console.log('🧪 DEBUG: Sending test notification to:', receiverId);

        const testNotification = {
            senderId: 'debug-system',
            receiverId: receiverId,
            title: 'Test Notification',
            message: message || 'This is a test notification from debug system',
            type: 'system'
        };

        // Create notification
        const notification = await Notification.create(testNotification);

        // Try to send via socket
        const socketId = global.users.get(receiverId);
        if (socketId && global.io) {
            global.io.to(socketId).emit("new_notification", notification);
            console.log('✅ DEBUG: Test notification sent via socket to:', socketId);
        } else {
            console.log('❌ DEBUG: User not connected via socket:', receiverId);
        }

        res.json({
            success: true,
            notification,
            socketDelivered: !!socketId,
            socketId: socketId
        });

    } catch (error) {
        console.error('❌ DEBUG: Test notification failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// Mark as read endpoint - FIXED
noticeRouter.patch("/:id/read", async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, error: "Notification not found" });
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

noticeRouter.get("/debug/:userId", debugUserNotifications);

module.exports = noticeRouter;