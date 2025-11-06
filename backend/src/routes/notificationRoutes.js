


// routes/notificationRoutes.js
const express = require("express");
const noticeRouter = express.Router();
const {
    createNotification,
    updateUserFcmToken,
    getUserNotifications
} = require("../controllers/notificationController");

noticeRouter.post("/send", createNotification);
noticeRouter.post("/notiUpdate", updateUserFcmToken);
noticeRouter.get("/:userId", getUserNotifications);

module.exports = noticeRouter;