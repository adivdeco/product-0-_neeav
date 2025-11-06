
// controllers/notificationController.js
const Notification = require("../models/Notification");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/userSchema");
const admin = require("../config/firebaseAdmin");

// Helper function to get FCM token
const getFcmTokenByUserId = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user?.fcmToken || null;
    } catch (error) {
        console.error("Error getting FCM token:", error);
        return null;
    }
};

// Helper function to update user's FCM token
const updateUserFcmToken = async (req, res) => {
    try {
        const { userId, token } = req.body;

        if (!userId || !token) {
            return res.status(400).json({
                success: false,
                error: "UserId and token are required"
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { fcmToken: token },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        res.json({
            success: true,
            message: "FCM token updated successfully"
        });
    } catch (error) {
        console.error("Error updating FCM token:", error);
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }

        const notifications = await Notification.find({ receiverId: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('senderId', 'name email');

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
};

// Create notification
const createNotification = async (req, res) => {
    try {
        const {
            senderId,
            receiverId,
            title,
            message,
            type = "system",
            // Service request fields
            projectType,
            workDescription,
            timeline,
            startDate,
            address,
            specialRequirements,
            urgency,
            contractorName,
            customerName,
            customerPhone,
            customerEmail
        } = req.body;

        console.log("📨 Received notification request:", {
            senderId, receiverId, title, message, type
        });

        // Validate required fields for notification
        if (!senderId || !receiverId || !title || !message) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: senderId, receiverId, title, message"
            });
        }

        // If it's a service request, create ServiceRequest document
        let serviceRequest = null;
        if (type === "service_request") {
            // Validate service request required fields
            if (!projectType || !workDescription || !timeline || !address) {
                return res.status(400).json({
                    success: false,
                    error: "Missing service request fields: projectType, workDescription, timeline, address"
                });
            }

            serviceRequest = await ServiceRequest.create({
                customerId: senderId,
                contractorId: receiverId,
                projectType,
                workDescription,
                timeline,
                startDate,
                address,
                specialRequirements,
                urgency: urgency || "normal",
                contractorName,
                customerName,
                customerPhone,
                customerEmail,
                status: "pending"
            });

            console.log("✅ Service request created:", serviceRequest._id);
        }

        // Create notification
        const notification = await Notification.create({
            senderId,
            receiverId,
            title,
            message,
            type,
            data: serviceRequest ? { serviceRequestId: serviceRequest._id } : {}
        });

        console.log("✅ Notification created:", notification._id);

        // 1️⃣ Send live notification if user is online (Socket.IO)
        const socketId = global.users?.get(receiverId.toString());
        if (socketId && global.io) {
            // Include service request data in socket emission
            const socketData = {
                ...notification.toObject(),
                serviceRequest: serviceRequest ? serviceRequest.toObject() : null
            };
            global.io.to(socketId).emit("new_notification", socketData);
            console.log("🔔 Real-time notification sent via socket to:", receiverId);
        } else {
            console.log("⚠️ User not connected via socket:", receiverId);
        }

        // 2️⃣ Send Firebase Push Notification (background)
        const receiverToken = await getFcmTokenByUserId(receiverId);
        if (receiverToken) {
            try {
                await admin.messaging().send({
                    token: receiverToken,
                    notification: {
                        title: title,
                        body: message,
                    },
                    data: {
                        type: type,
                        notificationId: notification._id.toString(),
                        ...(serviceRequest && { serviceRequestId: serviceRequest._id.toString() })
                    },
                });
                console.log("📱 Push notification sent via FCM to:", receiverId);
            } catch (fcmError) {
                console.error("❌ FCM Error:", fcmError);
                // Don't fail the request if FCM fails
            }
        } else {
            console.log("⚠️ No FCM token found for user:", receiverId);
        }

        res.status(201).json({
            success: true,
            notification,
            ...(serviceRequest && { serviceRequest })
        });

    } catch (error) {
        console.error("❌ Error creating notification:", error);
        res.status(500).json({
            success: false,
            error: "Server error",
            details: error.message
        });
    }
};

module.exports = {
    createNotification,
    updateUserFcmToken,
    getUserNotifications,
    getFcmTokenByUserId // Export if needed elsewhere
};