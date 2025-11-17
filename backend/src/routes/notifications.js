const express = require('express');
const Notification = require('../models/notification');
const NotificationRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware')

// Get user notifications
NotificationRouter.get('/', authMiddleware, async (req, res) => {
    try {

        const userId = req.finduser._id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { page = 1, limit = 20, unreadOnly } = req.query;

        const filter = { user: userId };
        if (unreadOnly === 'true') filter.isRead = false;

        const notifications = await Notification.find(filter)
            .populate('relatedRequest')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({
            user: userId,
            isRead: false
        });

        res.json({
            notifications,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            unreadCount
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark notification as read
NotificationRouter.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification });

    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark all notifications as read
NotificationRouter.put('/read-all', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;

        await Notification.updateMany(
            { user: userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = NotificationRouter;