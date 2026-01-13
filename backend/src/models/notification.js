const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'work_request',
            'request_accepted',
            'request_rejected',
            'work_completed',
            'status_updated',
            'buy_request',
            'buy_request_accepted',
            'buy_request_rejected',
            'order_shipped',
            'order_delivered',
            // In your notification schema, add these types:

            'buy_request_pending',
            'buy_request_accepted',
            'buy_request_rejected',
            'buy_request_cancelled',
            'buy_request_shipped',
            'buy_request_delivered',
            'buy_request_completed',
            'employee_contact_buyer',
            'employee_contact_shop'

        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    relatedRequest: {
        type: Schema.Types.ObjectId,
        ref: 'WorkRequest'
    },
    relatedBuyRequest: {
        type: Schema.Types.ObjectId,
        ref: 'BuyRequest'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 }); // Optimized for "Get my latest notifications"
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification