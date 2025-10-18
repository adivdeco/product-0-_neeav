


const mongoose = require('mongoose');
const { Schema } = mongoose;


const billSchema = new Schema({
    // Shop reference
    shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },

    // Customer information
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },

    customerName: {
        type: String,
        required: true
    },
    customerPhone: String,
    customerEmail: String,

    // Bill metadata
    billNumber: {
        type: String,
        required: true,
        unique: true
    },
    billDate: {
        type: Date,
        default: Date.now
    },
    dueDate: Date,

    // Bill items
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unit: {
            type: String,
            enum: ['kg', 'g', 'l', 'ml', 'pcs', 'pack'],
            default: 'pcs'
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0
        },
        taxRate: {
            type: Number,
            default: 0
        }
    }],

    // Payment information
    paymentStatus: {
        type: String,
        enum: ['paid', 'pending', 'partial'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank_transfer', 'credit'],
        default: 'cash'
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true
    },

    // Credit information (if applicable)
    isCredit: {
        type: Boolean,
        default: true
    },
    creditPeriod: Number, // in days
    creditInterestRate: Number,

    // Additional charges
    deliveryCharge: {
        type: Number,
        default: 0
    },
    packagingCharge: {
        type: Number,
        default: 0
    },

    // Notes and references
    notes: String,
    referenceNumber: String, // for cheque, transaction ID, etc.

    // Bill status
    status: {
        type: String,
        enum: ['active', 'cancelled', 'refunded'],
        default: 'active'
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },

    // For digital signature/verification (future blockchain use)
    // digitalSignature: String,
    // billHash: String
});

// Update the updatedAt field before saving
billSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for remaining amount
billSchema.virtual('remainingAmount').get(function () {
    return this.grandTotal - this.amountPaid;
});

// Index for better query performance
billSchema.index({ shopId: 1, billDate: -1 });
billSchema.index({ shopId: 1, customerId: 1 });
billSchema.index({ shopId: 1, paymentStatus: 1 });

const mongoosePaginate = require('mongoose-paginate-v2');
billSchema.plugin(mongoosePaginate);


const Bills = mongoose.model('bills', billSchema);
module.exports = Bills;