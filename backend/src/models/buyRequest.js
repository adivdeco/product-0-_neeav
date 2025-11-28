const mongoose = require('mongoose');
const { Schema } = mongoose;

const buyRequestSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'shipped'],
        default: 'pending'
    },
    shippingAddress: {
        type: {
            type: String,
            enum: ['home', 'work', 'site', 'other'],
            default: 'home'
        },
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
        landmark: String,
        contactPerson: String,
        contactPhone: String,
        instructions: String
    },
    contactInfo: {
        phone: String,
        email: String
    },
    message: String,
    expectedDelivery: Date,
    actualDelivery: Date, // ADDED: For tracking actual delivery
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery', 'online_payment', 'bank_transfer'],
        default: 'cash_on_delivery'
    },
    // For employee assignment
    assignedEmployee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    employeeActions: [{
        employee: { type: Schema.Types.ObjectId, ref: 'Employee' },
        action: {
            type: String,
            enum: ['contacted_user', 'contacted_shop', 'status_updated', 'note_added']
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
    rejectionReason: String,
    cancellationReason: String, // ADDED: For user cancellation
    lastReminderSent: Date, // ADDED: Missing field
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

buyRequestSchema.index({ user: 1 });
buyRequestSchema.index({ shopOwner: 1 });
buyRequestSchema.index({ status: 1 });
buyRequestSchema.index({ expiresAt: 1 });

const BuyRequest = mongoose.model('BuyRequest', buyRequestSchema);
module.exports = BuyRequest;