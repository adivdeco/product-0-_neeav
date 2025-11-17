const express = require('express');
const WorkRequest = require('../models/workRequest');
const Notification = require('../models/notification');
const User = require('../models/userSchema');
const WorkRoute = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Create work request
WorkRoute.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { title, description, category, assignedContractor, budget, location, timeline } = req.body;

        // Validate assigned contractor exists and is actually a contractor
        const contractor = await User.findById(assignedContractor);
        if (!contractor || contractor.role !== 'contractor') {
            return res.status(400).json({ message: 'Invalid contractor selected' });
        }

        const workRequest = await WorkRequest.create({
            title,
            description,
            category,
            user: userId,
            assignedContractor,
            budget,
            location,
            timeline
        });

        // Populate user info for notification
        const user = await User.findById(userId).select("-password");

        // Create notification for contractor
        const notification = await Notification.create({
            user: assignedContractor,
            type: 'work_request',
            title: 'New Work Request',
            message: `You have a new ${category} request from ${user.name}`,
            relatedRequest: workRequest._id,
            actionRequired: true,
            priority: 'high'
        });

        // Real-time notification to contractor
        const contractorSocketId = global.users.get(assignedContractor.toString());

        if (contractorSocketId) {
            // 1. Send notification
            global.io.to(contractorSocketId).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: assignedContractor,
                    isRead: false
                })
            });
            // koi issue aay remove this
            global.io.to(`user_${assignedContractor}`).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: assignedContractor,
                    isRead: false
                })
            });

            // 2. Send specific work request data for immediate display
            global.io.to(contractorSocketId).emit('new_work_request', {
                workRequest: await WorkRequest.findById(workRequest._id)
                    .populate('user', 'name email phone avatar'),
                message: `New ${category} request from ${user.name}`
            });

        }

        // In WorkRoute.post('/') - Add debugging
        console.log('🔍 Checking contractor socket connection:');
        console.log('- Contractor ID:', assignedContractor.toString());
        console.log('- Global users map:', Array.from(global.users.entries()));
        console.log('- Contractor socket ID:', contractorSocketId);

        if (contractorSocketId) {
            console.log('✅ Sending real-time events to contractor');
        } else {
            console.log('❌ Contractor not connected via socket - will see on next refresh');
        }

        res.status(201).json({
            message: 'Work request created successfully',
            workRequest
        });

    } catch (error) {
        console.error('Create work request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get contractor's work requests
WorkRoute.get('/contractor-requests', authMiddleware, async (req, res) => {
    try {
        const contractorId = req.finduser._id;
        if (!contractorId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { status, page = 1, limit = 10 } = req.query;

        const filter = { assignedContractor: contractorId };
        if (status) filter.status = status;

        const requests = await WorkRequest.find(filter)
            .populate('user', 'name email phone avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await WorkRequest.countDocuments(filter);

        res.json({
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error('Get contractor requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Accept work request
WorkRoute.put('/:id/accept', authMiddleware, async (req, res) => {
    try {
        const contractorId = req.finduser._id;
        const { id } = req.params;

        const workRequest = await WorkRequest.findOne({
            _id: id,
            assignedContractor: contractorId,
            status: 'pending'
        });

        if (!workRequest) {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }

        // Update contractor availability
        await User.findByIdAndUpdate(contractorId, {
            'contractorDetails.availability': 'busy',
            'contractorDetails.currentWork': id
        });

        workRequest.status = 'accepted';
        workRequest.acceptedBy = contractorId;
        await workRequest.save();

        // Notify user
        await Notification.create({
            user: workRequest.user,
            type: 'request_accepted',
            title: 'Request Accepted',
            message: `Your ${workRequest.category} request has been accepted`,
            relatedRequest: workRequest._id,
            priority: 'medium'
        });
        // After accepting work request, add:
        const userSocketId = global.users.get(workRequest.user.toString());
        if (userSocketId) {
            global.io.to(userSocketId).emit('request_accepted', {
                workRequest,
                notification: {
                    title: 'Request Accepted',
                    message: `Your ${workRequest.category} request has been accepted by contractor`
                }
            });
        }

        res.json({
            message: 'Work request accepted successfully',
            workRequest
        });

    } catch (error) {
        console.error('Accept work request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// mark worke compleate by ADMIN
WorkRoute.put('/:id/complete', adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.finduser._id;
        const userRole = req.finduser.role;

        const workRequest = await WorkRequest.findById(id);
        if (!workRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Only user, admin, or assigned contractor can mark complete
        const canComplete = userRole === 'admin' ||
            userRole === 'co-admin' ||
            workRequest.user.toString() === userId ||
            workRequest.assignedContractor.toString() === userId;

        if (!canComplete) {
            return res.status(403).json({ message: 'Not authorized to complete this request' });
        }

        // Update work request status
        workRequest.status = 'completed';
        workRequest.updatedAt = new Date();
        await workRequest.save();

        // Free up the contractor
        await User.findByIdAndUpdate(workRequest.assignedContractor, {
            'contractorDetails.availability': 'available',
            'contractorDetails.currentWork': null,
            'contractorDetails.completedProjects': { $inc: 1 }
        });

        // Notify all parties
        await Notification.create({
            user: workRequest.user,
            type: 'work_completed',
            title: 'Work Completed',
            message: `Your ${workRequest.category} request has been marked as completed`,
            relatedRequest: workRequest._id
        });

        await Notification.create({
            user: workRequest.assignedContractor,
            type: 'work_completed',
            title: 'Work Completed',
            message: `Your work on "${workRequest.title}" has been marked as completed`,
            relatedRequest: workRequest._id
        });

        res.json({
            message: 'Work marked as completed successfully',
            workRequest
        });

    } catch (error) {
        console.error('Complete work request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Reject work request by contractor
WorkRoute.put('/:id/reject', authMiddleware, async (req, res) => {
    try {
        const contractorId = req.finduser._id;
        const { id } = req.params;
        const { reason } = req.body;

        const workRequest = await WorkRequest.findOne({
            _id: id,
            assignedContractor: contractorId,
            status: 'pending'
        });

        if (!workRequest) {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }

        workRequest.status = 'rejected';
        workRequest.rejectedBy = contractorId;
        workRequest.rejectionReason = reason;
        await workRequest.save();

        // Notify user
        await Notification.create({
            user: workRequest.user,
            type: 'request_rejected',
            title: 'Request Declined',
            message: `Your ${workRequest.category} request was declined. ${reason ? `Reason: ${reason}` : ''}`,
            relatedRequest: workRequest._id,
            priority: 'medium'
        });

        // After rejecting work request, add:
        const userSocketId = global.users.get(workRequest.user.toString());
        if (userSocketId) {
            global.io.to(userSocketId).emit('request_rejected', {
                workRequest,
                notification: {
                    title: 'Request Declined',
                    message: `Your ${workRequest.category} request was declined`
                }
            });
        }
        res.json({
            message: 'Work request declined successfully',
            workRequest
        });

    } catch (error) {
        console.error('Reject work request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});





// Get user's own work requests
WorkRoute.get('/my-requests', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { page = 1, limit = 10, status } = req.query;

        const filter = { user: userId };
        if (status) filter.status = status;

        const requests = await WorkRequest.find(filter)
            .populate('assignedContractor', 'name email phone avatar contractorDetails')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await WorkRequest.countDocuments(filter);

        res.json({
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        console.error('Get user requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User cancels their own request
WorkRoute.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { id } = req.params;
        const { reason } = req.body;

        const workRequest = await WorkRequest.findOne({
            _id: id,
            user: userId,
            status: { $in: ['pending', 'accepted'] } // Can only cancel pending or accepted requests
        });

        if (!workRequest) {
            return res.status(404).json({
                message: 'Request not found or cannot be cancelled'
            });
        }

        // Store old status for notification
        const oldStatus = workRequest.status;

        // Update request status
        workRequest.status = 'cancelled';
        workRequest.cancellationReason = reason || 'Cancelled by user';
        workRequest.updatedAt = new Date();
        await workRequest.save();

        // If contractor was assigned and busy, free them up
        if (oldStatus === 'accepted' && workRequest.assignedContractor) {
            await User.findByIdAndUpdate(workRequest.assignedContractor, {
                'contractorDetails.availability': 'available',
                'contractorDetails.currentWork': null
            });
        }

        // Notify contractor if request was accepted
        if (oldStatus === 'accepted') {
            await Notification.create({
                user: workRequest.assignedContractor,
                type: 'work_cancelled',
                title: 'Work Cancelled',
                message: `User cancelled the "${workRequest.title}" request`,
                relatedRequest: workRequest._id
            });

            // Real-time notification to contractor
            const contractorSocketId = global.users.get(workRequest.assignedContractor.toString());
            if (contractorSocketId) {
                global.io.to(contractorSocketId).emit('request_cancelled', {
                    workRequest,
                    notification: {
                        title: 'Work Cancelled',
                        message: `User cancelled the "${workRequest.title}" request`
                    }
                });
            }
        }

        res.json({
            message: 'Request cancelled successfully',
            workRequest
        });

    } catch (error) {
        console.error('Cancel work request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User marks work as completed
WorkRoute.put('/:id/complete-by-user', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { id } = req.params;

        const workRequest = await WorkRequest.findOne({
            _id: id,
            user: userId,
            status: 'accepted' // Only can complete accepted requests
        });

        if (!workRequest) {
            return res.status(404).json({
                message: 'Request not found or cannot be completed'
            });
        }

        // Update work request status
        workRequest.status = 'completed';
        workRequest.completedAt = new Date();
        workRequest.updatedAt = new Date();
        await workRequest.save();

        // Free up the contractor and increment their completed projects
        await User.findByIdAndUpdate(workRequest.assignedContractor, {
            'contractorDetails.availability': 'available',
            'contractorDetails.currentWork': null,
            'contractorDetails.completedProjects': { $inc: 1 }
        });

        // Notify contractor
        await Notification.create({
            user: workRequest.assignedContractor,
            type: 'work_completed',
            title: 'Work Completed by User',
            message: `User marked "${workRequest.title}" as completed`,
            relatedRequest: workRequest._id
        });

        // Real-time notification to contractor
        const contractorSocketId = global.users.get(workRequest.assignedContractor.toString());
        if (contractorSocketId) {
            global.io.to(contractorSocketId).emit('work_completed', {
                workRequest,
                notification: {
                    title: 'Work Completed',
                    message: `User marked "${workRequest.title}" as completed`
                }
            });
        }

        res.json({
            message: 'Work marked as completed successfully',
            workRequest
        });

    } catch (error) {
        console.error('Complete work by user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = WorkRoute;