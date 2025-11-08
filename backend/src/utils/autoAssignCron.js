// utils/autoAssignCron.js
const cron = require('node-cron');
const WorkRequest = require('../models/workRequest');
const Employee = require('../models/employee');
const Notification = require('../models/notification');

const autoAssignExpiredRequests = async () => {
    try {
        console.log('Running auto-assignment for expired requests...');

        const expiredRequests = await WorkRequest.find({
            status: 'pending',
            expiresAt: { $lt: new Date() },
            assignedEmployee: { $exists: false }
        });

        const availableEmployees = await Employee.find({
            isActive: true,
            'permissions.canContactContractors': true
        });

        let assignedCount = 0;

        for (const request of expiredRequests) {
            if (availableEmployees.length === 0) break;

            const employeeIndex = assignedCount % availableEmployees.length;
            const employee = availableEmployees[employeeIndex];

            request.assignedEmployee = employee._id;
            request.escalationLevel = 1;
            await request.save();

            await Notification.create({
                user: employee.user,
                type: 'work_request',
                title: 'Expired Request Assigned',
                message: `A work request has expired and been auto-assigned to you: ${request.title}`,
                relatedRequest: request._id,
                actionRequired: true,
                priority: 'high'
            });

            assignedCount++;
        }

        console.log(`Auto-assigned ${assignedCount} expired requests`);
    } catch (error) {
        console.error('Auto-assignment cron job error:', error);
    }
};

// Run every 30 minutes
cron.schedule('*/30 * * * *', autoAssignExpiredRequests);

module.exports = { autoAssignExpiredRequests };