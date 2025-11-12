
const express = require('express');
const WorkRequest = require('../models/workRequest');
const Employee = require('../models/employee');
const Notification = require('../models/notification');
const User = require('../models/userSchema');
const employeeRoutes = express.Router();

const requireEmployee = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await User.findById(userId);
        if (!user || (user.role !== 'admin' && user.role !== 'co-admin')) {
            return res.status(403).json({ message: 'Access denied. Employee/admin access required.' });
        }

        // Check if employee record exists, create if not
        let employee = await Employee.findOne({ user: userId });
        if (!employee) {
            employee = await Employee.create({
                user: userId,
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
        console.error('Employee middleware error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

employeeRoutes.get('/pending-requests', requireEmployee, async (req, res) => {
    try {
        console.log('🔍 Employee ID:', req.employee._id);
        console.log('🔍 User ID from session:', req.session.userId);

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


employeeRoutes.post('/:requestId/contact-contractor', requireEmployee, async (req, res) => {
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
employeeRoutes.post('/:requestId/contact-user', requireEmployee, async (req, res) => {
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
employeeRoutes.get('/request/:requestId', requireEmployee, async (req, res) => {
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
employeeRoutes.post('/:requestId/assign', requireEmployee, async (req, res) => {
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


employeeRoutes.post('/auto-assign/expired', requireEmployee, async (req, res) => {
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
employeeRoutes.get('/stats', requireEmployee, async (req, res) => {
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
employeeRoutes.get('/employees', requireEmployee, async (req, res) => {
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

module.exports = employeeRoutes;