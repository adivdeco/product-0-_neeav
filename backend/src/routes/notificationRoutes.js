// const express = require("express");
// const noticeRouter = express.Router();
// const { createNotification, getUserFcmToken } = require("../controllers/notificationController");

// noticeRouter.post("/send", createNotification);
// noticeRouter.post("/notiUpdate", getUserFcmToken)

// module.exports = noticeRouter;



const express = require("express");
const noticeRouter = express.Router();
const { createNotification, saveFcmToken } = require("../controllers/notificationController");

noticeRouter.post("/send", createNotification);        // create and send
noticeRouter.post("/notiUpdate", saveFcmToken);       // save token from client

// Add GET route to fetch notifications for a user
noticeRouter.get("/:userId", async (req, res) => {
    const Notification = require("../models/notification");
    try {
        const notifications = await Notification.find({ receiverId: req.params.userId }).sort({ createdAt: -1 }).limit(100);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
});

module.exports = noticeRouter;
