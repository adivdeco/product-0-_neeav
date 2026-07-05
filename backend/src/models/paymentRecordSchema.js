const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentRecordSchema = new Schema({
    shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank_transfer'],
        default: 'cash'
    },
    notes: {
        type: String,
        trim: true
    },
    // Snapshot of customer balance after this payment
    balanceAfter: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
paymentRecordSchema.index({ shopId: 1, customerId: 1 });
paymentRecordSchema.index({ customerId: 1, date: -1 });

const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);
module.exports = PaymentRecord;
