// models/workRequest.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workRequestSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    category: {
        type: String,
        enum: ['Maintenance', 'Construction', 'Renovation', 'Repair', 'Other'],
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedContractor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    location: {
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    budget: {
        type: Number,
        min: 0,
        default: 0
    },
    timeline: {
        expectedStart: Date,
        expectedEnd: Date
    },
    // laterr added
    assignedEmployee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    employeeActions: [{
        employee: { type: Schema.Types.ObjectId, ref: 'Employee' },
        action: {
            type: String,
            enum: ['contacted_contractor', 'contacted_user', 'status_updated', 'note_added']
        },
        message: String,
        contactMethod: {
            type: String,
            enum: ['in_app', 'phone', 'email', 'sms']
        },
        createdAt: { type: Date, default: Date.now }
    }],
    escalationLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 3
    },
    lastReminderSent: Date,

    // till hear

    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

workRequestSchema.index({ user: 1 });
workRequestSchema.index({ assignedContractor: 1 });
workRequestSchema.index({ status: 1 });
workRequestSchema.index({ expiresAt: 1 });

const WorkRequest = mongoose.model('WorkRequest', workRequestSchema);

module.exports = WorkRequest