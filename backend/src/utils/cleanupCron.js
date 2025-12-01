
const cron = require('node-cron');
const WorkRequest = require('../models/workRequest');
const Notification = require('../models/notification');

const cleanupOldRequests = async () => {
    try {
        console.log('🔄 Running database cleanup...');
        const thirtyDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Delete completed requests older than 10 days
        const completedResult = await WorkRequest.deleteMany({
            status: 'completed',
            updatedAt: { $lt: thirtyDaysAgo }
        });

        // Delete cancelled/rejected requests older than 7 days
        const cancelledResult = await WorkRequest.deleteMany({
            status: { $in: ['cancelled', 'rejected'] },
            updatedAt: { $lt: sevenDaysAgo }
        });

        // Clean up old notifications (keep only 10 days)
        const notificationResult = await Notification.deleteMany({
            createdAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
        });

        console.log(`🗑️ Cleanup completed:
        - ${completedResult.deletedCount} completed requests
        - ${cancelledResult.deletedCount} cancelled/rejected requests  
        - ${notificationResult.deletedCount} old notifications
        `);

    } catch (error) {
        console.error('Cleanup error:', error);
    }
};

// Run daily at 2 AM
cron.schedule('0 2 * * *', cleanupOldRequests);

module.exports = { cleanupOldRequests };