// models/employee.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        unique: true,
        required: true
    },
    department: {
        type: String,
        enum: ['customer_service', 'operations', 'admin'],
        required: true
    },
    permissions: {
        canViewAllRequests: { type: Boolean, default: true },
        canContactContractors: { type: Boolean, default: true },
        canUpdateRequestStatus: { type: Boolean, default: true },
        canAssignRequests: { type: Boolean, default: true }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    assignedRequests: [{
        request: { type: Schema.Types.ObjectId, ref: 'WorkRequest' },
        assignedAt: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['pending', 'contacted', 'resolved'],
            default: 'pending'
        }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

employeeSchema.index({ user: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ department: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee