// utils/createEmployeeRecords.js
const User = require('../models/userSchema');
const Employee = require('../models/employee');

const createEmployeeRecords = async () => {
    try {
        console.log('🔄 Checking for admin employee records...');

        const admins = await User.find({
            role: { $in: ['admin', 'co-admin'] }
        });

        let createdCount = 0;
        let existingCount = 0;

        for (const admin of admins) {
            const existingEmployee = await Employee.findOne({ user: admin._id });
            if (!existingEmployee) {
                await Employee.create({
                    user: admin._id,
                    employeeId: `EMP${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
                    department: admin.role === 'admin' ? 'admin' : 'customer_service',
                    permissions: {
                        canViewAllRequests: true,
                        canContactContractors: true,
                        canContactUsers: true,
                        canUpdateRequestStatus: admin.role === 'admin',
                        canAssignRequests: admin.role === 'admin'
                    }
                });
                console.log(`✅ Created employee record for: ${admin.name} (${admin.role})`);
                createdCount++;
            } else {
                existingCount++;
            }
        }

        console.log(`📊 Employee records: ${createdCount} created, ${existingCount} already existed`);
        return { created: createdCount, existing: existingCount };

    } catch (error) {
        console.error('❌ Error creating employee records:', error);
        throw error;
    }
};

module.exports = createEmployeeRecords;