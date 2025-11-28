
const express = require('express');
const WorkRequest = require('../models/workRequest');
const Employee = require('../models/employee');
const Notification = require('../models/notification');
const User = require('../models/userSchema');
const employeeRoutes = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const Product = require('../models/productSchema');
const BuyRequest = require('../models/buyRequest');
const jwt = require('jsonwebtoken')



const combinedAuthMiddleware = async (req, res, next) => {
    try {
        // First, execute adminMiddleware logic
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Not logged in" });

        const payload = jwt.verify(token, "secretkey");
        const { userId, role } = payload;

        if (!userId || (role !== 'co-admin' && role !== "admin")) {
            return res.status(403).send("Forbidden: You do not have admin access");
        }

        const finduser = await User.findById(payload.userId).select('-password');
        req.finduser = finduser;

        // Then, execute requireEmployee logic
        if (!finduser._id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await User.findById(finduser._id);
        if (!user || (user.role !== 'admin' && user.role !== 'co-admin')) {
            return res.status(403).json({ message: 'Access denied. Employee/admin access required.' });
        }

        // Check if employee record exists, create if not
        let employee = await Employee.findOne({ user: finduser._id });
        if (!employee) {
            employee = await Employee.create({
                user: finduser._id,
                employeeId: `EMP${Date.now()}`,
                department: user.role === 'admin' ? 'admin' : 'customer_service',
                name: user.name,
                email: user.email,
                phone: user.phone
            });
        }

        req.employee = employee;
        next();
    } catch (error) {
        console.error('Combined auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


employeeRoutes.get('/pending-requests', combinedAuthMiddleware, async (req, res) => {
    try {
        console.log('🔍 Employee ID:', req.employee._id);
        console.log('🔍 User ID from session:', req.finduser._id);

        const { page = 1, limit = 20 } = req.query;

        // Get requests that need attention
        const filter = {
            status: 'pending',
            // $or: [
            //     { expiresAt: { $lt: new Date(Date.now() + 4 * 60 * 60 * 1000) } }, // Expiring in 4 hours
            //     { escalationLevel: { $gt: 0 } },
            //     { assignedEmployee: req.employee._id }
            // ]
        };

        console.log('🔍 Filter being used:', JSON.stringify(filter, null, 2));

        const requests = await WorkRequest.find()
            .populate('user', 'name email phone avatar')
            .populate('assignedContractor', 'name email phone avatar contractorDetails')
            .populate('assignedEmployee', 'employeeId user')
            .populate('employeeActions.employee', 'employeeId');

        // console.log('🔍 Found requests:', requests.length);
        // console.log('🔍 Requests details:', JSON.stringify(requests, null, 2));

        const total = await WorkRequest.countDocuments();

        res.json({
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


employeeRoutes.post('/:requestId/contact-contractor', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { message, contactMethod = 'in_app' } = req.body;

        const workRequest = await WorkRequest.findById(requestId)
            .populate('assignedContractor', 'name email phone ')
            .populate('user', 'name');

        if (!workRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }


        workRequest.employeeActions.push({
            employee: req.employee._id,
            action: 'contacted_contractor',
            message: message,
            contactMethod: contactMethod
        });

        // Increase escalation level
        workRequest.escalationLevel = Math.min(workRequest.escalationLevel + 1, 3);
        workRequest.assignedEmployee = req.employee._id;
        workRequest.lastReminderSent = new Date();

        await workRequest.save();


        const notification = await Notification.create({
            user: workRequest.assignedContractor._id,
            type: 'work_request',
            title: 'Follow-up: Work Request',
            message: `Customer service contacted you regarding pending work request from ${workRequest.user.name}: ${message}`,
            relatedRequest: workRequest._id,
            priority: 'high',
            actionRequired: true
        });

        // Real-time notification to contractor
        const contractorSocketId = global.users.get(workRequest.assignedContractor._id.toString());
        if (contractorSocketId) {
            global.io.to(contractorSocketId).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: workRequest.assignedContractor._id,
                    isRead: false
                })
            });

            global.io.to(contractorSocketId).emit('employee_contact', {
                workRequest: {
                    _id: workRequest._id,
                    title: workRequest.title,
                    category: workRequest.category
                },
                message: message,
                contactMethod: contactMethod,
                employee: {
                    employeeId: req.employee.employeeId
                }
            });
        }

        // Update employee's assigned requests
        await Employee.findByIdAndUpdate(req.employee._id, {
            $addToSet: {
                assignedRequests: {
                    request: workRequest._id,
                    status: 'contacted'
                }
            }
        });

        res.json({
            message: 'Contractor contacted successfully',
            workRequest
        });

    } catch (error) {
        console.error('Contact contractor error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Employee contacts user
employeeRoutes.post('/:requestId/contact-user', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { message, contactMethod = 'in_app' } = req.body;

        const workRequest = await WorkRequest.findById(requestId)
            .populate('user', 'name email phone')
            .populate('assignedContractor', 'name email phone');

        if (!workRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Add employee action
        workRequest.employeeActions.push({
            employee: req.employee._id,
            action: 'contacted_user',
            message: message,
            contactMethod: contactMethod
        });

        workRequest.assignedEmployee = req.employee._id;
        await workRequest.save();

        // Create notification for user
        const notification = await Notification.create({
            user: workRequest.user._id,
            type: 'status_updated',
            title: 'Update on Your Request',
            message: `Customer service: ${message}`,
            relatedRequest: workRequest._id,
            priority: 'medium'
        });

        // Real-time notification to user
        const userSocketId = global.users.get(workRequest.user._id.toString());
        if (userSocketId) {
            global.io.to(userSocketId).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: workRequest.user._id,
                    isRead: false
                })
            });
        }

        // Update employee's assigned requests
        await Employee.findByIdAndUpdate(req.employee._id, {
            $addToSet: {
                assignedRequests: {
                    request: workRequest._id,
                    status: 'contacted'
                }
            }
        });

        res.json({
            message: 'User contacted successfully',
            workRequest
        });

    } catch (error) {
        console.error('Contact user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get request details for employee
employeeRoutes.get('/request/:requestId', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;

        const workRequest = await WorkRequest.findById(requestId)
            .populate('user', 'name email phone avatar address')
            .populate('assignedContractor', 'name email phone contractorDetails')
            .populate('assignedEmployee', 'employeeId user')
            .populate('employeeActions.employee', 'employeeId user')
            .populate('employeeActions.employee.user', 'name');

        if (!workRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.json({ workRequest });

    } catch (error) {
        console.error('Get request details error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Assign request to specific employee
employeeRoutes.post('/:requestId/assign', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { employeeId } = req.body;

        // Check if current employee has permission to assign
        if (!req.employee.permissions.canAssignRequests) {
            return res.status(403).json({ message: 'You do not have permission to assign requests' });
        }

        const targetEmployee = await Employee.findById(employeeId);
        if (!targetEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const workRequest = await WorkRequest.findByIdAndUpdate(
            requestId,
            {
                assignedEmployee: employeeId,
                escalationLevel: Math.max(1, workRequest.escalationLevel)
            },
            { new: true }
        );

        if (!workRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Notify assigned employee
        await Notification.create({
            user: targetEmployee.user,
            type: 'work_request',
            title: 'Request Assigned to You',
            message: `A work request has been assigned to you for follow-up: ${workRequest.title}`,
            relatedRequest: workRequest._id,
            actionRequired: true,
            priority: 'high'
        });

        res.json({
            message: 'Request assigned successfully',
            workRequest
        });

    } catch (error) {
        console.error('Assign request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


employeeRoutes.post('/auto-assign/expired', combinedAuthMiddleware, async (req, res) => {
    try {
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

            // Assign to random available employee (round-robin for fairness)
            const employeeIndex = assignedCount % availableEmployees.length;
            const employee = availableEmployees[employeeIndex];

            request.assignedEmployee = employee._id;
            request.escalationLevel = 1;
            await request.save();

            // Notify employee
            await Notification.create({
                user: employee.user,
                type: 'work_request',
                title: 'Expired Request Assigned',
                message: `A work request has expired and been assigned to you for follow-up: ${request.title}`,
                relatedRequest: request._id,
                actionRequired: true,
                priority: 'high'
            });

            assignedCount++;
        }

        res.json({
            message: `Auto-assigned ${assignedCount} expired requests`,
            assignedCount
        });

    } catch (error) {
        console.error('Auto-assign error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get employee statistics
employeeRoutes.get('/stats', combinedAuthMiddleware, async (req, res) => {
    try {
        const totalPending = await WorkRequest.countDocuments({ status: 'pending' });
        const expiringSoon = await WorkRequest.countDocuments({
            status: 'pending',
            expiresAt: {
                $lt: new Date(Date.now() + 2 * 60 * 60 * 1000),
                $gt: new Date()
            }
        });
        const highPriority = await WorkRequest.countDocuments({
            status: 'pending',
            escalationLevel: { $gte: 2 }
        });
        const assignedToMe = await WorkRequest.countDocuments({
            status: 'pending',
            assignedEmployee: req.employee._id
        });

        res.json({
            totalPending,
            expiringSoon,
            highPriority,
            assignedToMe
        });

    } catch (error) {
        console.error('Get employee stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all employees (for admin)
employeeRoutes.get('/employees', combinedAuthMiddleware, async (req, res) => {
    try {
        // Only admin can see all employees
        if (req.employee.department !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const employees = await Employee.find()
            .populate('user', 'name email role')
            .select('-assignedRequests');

        res.json({ employees });

    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});




// shop related 



// Get ALL buy requests for employees with filtering

employeeRoutes.get('/buy-requests', combinedAuthMiddleware, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            escalationLevel,
            assignedToMe,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Escalation level filter
        if (escalationLevel) {
            filter.escalationLevel = parseInt(escalationLevel);
        }

        // Assigned to current employee filter
        if (assignedToMe === 'true') {
            filter.assignedEmployee = req.employee._id;
        }

        // Search filter - FIXED: Use proper population paths
        if (search) {
            filter.$or = [
                { 'product.name': { $regex: search, $options: 'i' } },
                { 'user.name': { $regex: search, $options: 'i' } },
                { 'shopOwner.name': { $regex: search, $options: 'i' } },
                { 'shopOwner.shopName': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // OPTIMIZED: Use lean() for better performance
        const requests = await BuyRequest.find(filter)
            .populate('product', 'name price category brand ProductImage unit stock')
            .populate('user', 'name email phone avatar')
            .populate('shopOwner', 'name email phone shopName avatar')
            .populate('assignedEmployee', 'employeeId user')
            .populate('employeeActions.employee', 'employeeId user')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean(); // ADD THIS FOR BETTER PERFORMANCE

        const total = await BuyRequest.countDocuments(filter);

        // OPTIMIZED: Get all stats in parallel for better performance
        const [
            statusStatsResult,
            escalationStatsResult,
            assignedToMeCount,
            expiringSoonCount
        ] = await Promise.all([
            // Status stats
            BuyRequest.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            // Escalation stats
            BuyRequest.aggregate([
                { $group: { _id: '$escalationLevel', count: { $sum: 1 } } }
            ]),
            // Assigned to me count
            BuyRequest.countDocuments({ assignedEmployee: req.employee._id }),
            // Expiring soon count
            BuyRequest.countDocuments({
                status: 'pending',
                expiresAt: {
                    $lt: new Date(Date.now() + 12 * 60 * 60 * 1000),
                    $gt: new Date()
                }
            })
        ]);

        // Convert stats to objects
        const statusStats = {};
        statusStatsResult.forEach(stat => {
            statusStats[stat._id] = stat.count;
        });

        const escalationStats = {};
        escalationStatsResult.forEach(stat => {
            escalationStats[stat._id] = stat.count;
        });

        res.json({
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total,
            stats: {
                byStatus: statusStats,
                byEscalation: escalationStats,
                assignedToMe: assignedToMeCount,
                expiringSoon: expiringSoonCount,
                total: total // ADD TOTAL COUNT
            }
        });

    } catch (error) {
        console.error('Get buy requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get buy request statistics - OPTIMIZED VERSION
employeeRoutes.get('/buy-requests/stats', combinedAuthMiddleware, async (req, res) => {
    try {
        // OPTIMIZED: Run all counts in parallel
        const [
            total,
            byStatus,
            byEscalation,
            recentActivity,
            assignedToMe,
            expiringSoon
        ] = await Promise.all([
            BuyRequest.countDocuments(),
            BuyRequest.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            BuyRequest.aggregate([
                { $group: { _id: '$escalationLevel', count: { $sum: 1 } } }
            ]),
            BuyRequest.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }),
            BuyRequest.countDocuments({
                assignedEmployee: req.employee._id
            }),
            BuyRequest.countDocuments({
                status: 'pending',
                expiresAt: {
                    $lt: new Date(Date.now() + 12 * 60 * 60 * 1000),
                    $gt: new Date()
                }
            })
        ]);

        // Convert to objects
        const statusStats = byStatus.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        const escalationStats = byEscalation.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.json({
            total,
            byStatus: statusStats,
            byEscalation: escalationStats,
            recentActivity,
            assignedToMe,
            expiringSoon // ADD THIS
        });

    } catch (error) {
        console.error('Get buy request stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Employee contacts shop owner about buy request
employeeRoutes.post('/buy-request/:requestId/contact-shop', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { message, contactMethod = 'in_app' } = req.body;

        const buyRequest = await BuyRequest.findById(requestId)
            .populate('shopOwner', 'name email phone')
            .populate('product', 'name');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Buy request not found' });
        }

        // Add employee action
        buyRequest.employeeActions.push({
            employee: req.employee._id,
            action: 'contacted_shop',
            message: message,
            contactMethod: contactMethod
        });

        buyRequest.escalationLevel = Math.min(buyRequest.escalationLevel + 1, 3);
        buyRequest.assignedEmployee = req.employee._id;
        buyRequest.lastReminderSent = new Date();

        await buyRequest.save();

        // Create notification for shop owner
        const notification = await Notification.create({
            user: buyRequest.shopOwner._id,
            type: 'status_updated',
            title: 'Update on Purchase Request',
            message: `Customer service: ${message}`,
            relatedBuyRequest: buyRequest._id,
            priority: 'medium'
        });

        // Real-time notification to shop owner
        const shopSocketId = global.users.get(buyRequest.shopOwner._id.toString());
        if (shopSocketId) {
            global.io.to(shopSocketId).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: buyRequest.shopOwner._id,
                    isRead: false
                })
            });
        }

        res.json({
            message: 'Shop owner contacted successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Contact shop error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Employee contacts buyer about buy request
employeeRoutes.post('/buy-request/:requestId/contact-buyer', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { message, contactMethod = 'in_app' } = req.body;

        const buyRequest = await BuyRequest.findById(requestId)
            .populate('user', 'name email phone')
            .populate('product', 'name')
            .populate('shopOwner', 'name');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Buy request not found' });
        }

        // Add employee action
        buyRequest.employeeActions.push({
            employee: req.employee._id,
            action: 'contacted_user',
            message: message,
            contactMethod: contactMethod
        });

        buyRequest.escalationLevel = Math.min(buyRequest.escalationLevel + 1, 3);
        buyRequest.assignedEmployee = req.employee._id;
        buyRequest.lastReminderSent = new Date();

        await buyRequest.save();

        // Create notification for buyer
        const notification = await Notification.create({
            user: buyRequest.user._id,
            type: 'status_updated',
            title: 'Update on Your Purchase Request',
            message: `Customer service: ${message}`,
            relatedBuyRequest: buyRequest._id,
            priority: 'medium'
        });

        // Real-time notification to buyer
        const buyerSocketId = global.users.get(buyRequest.user._id.toString());
        if (buyerSocketId) {
            global.io.to(buyerSocketId).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: buyRequest.user._id,
                    isRead: false
                })
            });
        }

        res.json({
            message: 'Buyer contacted successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Contact buyer error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update buy request delivery status
employeeRoutes.put('/buy-request/:requestId/delivery', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, expectedDelivery, actualDelivery, trackingNumber } = req.body;

        const updateData = { status };

        if (expectedDelivery) updateData.expectedDelivery = new Date(expectedDelivery);
        if (actualDelivery) updateData.actualDelivery = new Date(actualDelivery);
        if (trackingNumber) updateData.trackingNumber = trackingNumber;

        const buyRequest = await BuyRequest.findByIdAndUpdate(
            requestId,
            updateData,
            { new: true }
        )
            .populate('product', 'name')
            .populate('user', 'name email')
            .populate('shopOwner', 'name email');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Buy request not found' });
        }

        // Add employee action
        buyRequest.employeeActions.push({
            employee: req.employee._id,
            action: 'status_updated',
            message: `Delivery status updated to: ${status}`,
            contactMethod: 'in_app'
        });

        await buyRequest.save();

        // Create notification
        await Notification.create({
            user: buyRequest.user._id,
            type: `buy_request_${status}`,
            title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your order for ${buyRequest.product.name} has been ${status}`,
            relatedBuyRequest: buyRequest._id,
            priority: 'medium'
        });

        res.json({
            message: `Delivery status updated to ${status}`,
            buyRequest
        });

    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add note to buy request
employeeRoutes.post('/buy-request/:requestId/note', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { note } = req.body;

        const buyRequest = await BuyRequest.findById(requestId);
        if (!buyRequest) {
            return res.status(404).json({ message: 'Buy request not found' });
        }

        // Add employee action as note
        buyRequest.employeeActions.push({
            employee: req.employee._id,
            action: 'note_added',
            message: note,
            contactMethod: 'in_app'
        });

        await buyRequest.save();

        res.json({
            message: 'Note added successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Assign buy request to employee
employeeRoutes.post('/buy-request/:requestId/assign', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { employeeId } = req.body;

        const targetEmployee = await Employee.findById(employeeId);
        if (!targetEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const buyRequest = await BuyRequest.findByIdAndUpdate(
            requestId,
            {
                assignedEmployee: employeeId,
                escalationLevel: Math.max(1, buyRequest.escalationLevel || 0)
            },
            { new: true }
        );

        if (!buyRequest) {
            return res.status(404).json({ message: 'Buy request not found' });
        }

        // Add assignment action
        buyRequest.employeeActions.push({
            employee: req.employee._id,
            action: 'assigned_to_employee',
            message: `Assigned to employee: ${targetEmployee.employeeId}`,
            contactMethod: 'in_app'
        });

        await buyRequest.save();

        // Notify assigned employee
        await Notification.create({
            user: targetEmployee.user,
            type: 'buy_request_assigned',
            title: 'Buy Request Assigned',
            message: `A buy request has been assigned to you: ${buyRequest.product?.name || 'Unknown Product'}`,
            relatedBuyRequest: buyRequest._id,
            actionRequired: true,
            priority: 'medium'
        });

        res.json({
            message: 'Buy request assigned successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Assign buy request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update buy request status (including reopening)
employeeRoutes.put('/buy-request/:requestId/status', combinedAuthMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, reason } = req.body;

        // Validate status
        const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'shipped'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const buyRequest = await BuyRequest.findById(requestId)
            .populate('product', 'name')
            .populate('user', 'name email')
            .populate('shopOwner', 'name email');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Buy request not found' });
        }

        // Handle stock management for status changes
        if (status === 'accepted' && buyRequest.status === 'pending') {
            // Reduce stock when accepting
            await Product.findByIdAndUpdate(
                buyRequest.product._id,
                { $inc: { stock: -buyRequest.quantity } }
            );
        } else if ((status === 'cancelled' || status === 'rejected') && buyRequest.status === 'accepted') {
            // Restore stock when cancelling/rejecting an accepted order
            await Product.findByIdAndUpdate(
                buyRequest.product._id,
                { $inc: { stock: buyRequest.quantity } }
            );
        }

        // Update the request
        const updateData = { status };
        if (status === 'rejected') updateData.rejectionReason = reason;
        if (status === 'cancelled') updateData.cancellationReason = reason;

        // If reopening from completed/cancelled/rejected, reset some fields
        if ((status === 'pending' || status === 'accepted') &&
            ['completed', 'cancelled', 'rejected'].includes(buyRequest.status)) {
            updateData.actualDelivery = null;
            updateData.expectedDelivery = null;
        }

        const updatedRequest = await BuyRequest.findByIdAndUpdate(
            requestId,
            updateData,
            { new: true }
        );

        // Add employee action
        updatedRequest.employeeActions.push({
            employee: req.employee._id,
            action: 'status_updated',
            message: `Status changed from ${buyRequest.status} to ${status}${reason ? `: ${reason}` : ''}`,
            contactMethod: 'in_app'
        });

        await updatedRequest.save();

        // Create notification for user
        await Notification.create({
            user: updatedRequest.user._id,
            type: `buy_request_${status}`,
            title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your order for ${updatedRequest.product.name} has been ${status}${reason ? `: ${reason}` : ''}`,
            relatedBuyRequest: updatedRequest._id,
            priority: 'medium'
        });

        // Notify shop owner for relevant status changes
        if (['accepted', 'rejected', 'cancelled'].includes(status)) {
            await Notification.create({
                user: updatedRequest.shopOwner._id,
                type: 'status_updated',
                title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: `Order for ${updatedRequest.product.name} has been ${status}`,
                relatedBuyRequest: updatedRequest._id,
                priority: 'medium'
            });
        }

        res.json({
            message: `Buy request ${status} successfully`,
            buyRequest: updatedRequest
        });

    } catch (error) {
        console.error('Update buy request status error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});





module.exports = employeeRoutes;