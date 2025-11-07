// models/Notification.js - UPDATED
const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["service_request", "order", "message", "system"],
        default: "system",
    },
    isRead: { type: Boolean, default: false },
    data: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;