const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema({
    shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },

    // Address information
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        landmark: String
    },

    // Customer type (individual contractor, construction company, etc.)
    type: {
        type: String,
        enum: ['Individual', 'Contractor', 'Builder', 'Construction Company', 'Other'],
        default: 'Individual'
    },

    // Credit information
    creditLimit: {
        type: Number,
        default: 0
    },
    currentBalance: {
        type: Number,
        default: 0
    },
    creditAllowed: {
        type: Boolean,
        default: false
    },

    // Additional fields
    gstNumber: {
        type: String,
        uppercase: true
    },
    notes: String,

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    images: [{
        url: String,
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
customerSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for formatted address
customerSchema.virtual('formattedAddress').get(function () {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

// Index for better query performance
customerSchema.index({ shopId: 1, phone: 1 });
customerSchema.index({ shopId: 1, name: 1 });

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;



// // Instance method to check if customer can take more credit
// customerSchema.methods.canTakeCredit = function(amount) {
//     if (!this.creditAllowed) return false;
//     if (this.creditLimit === 0) return true; // No limit set
//     return (this.currentBalance + amount) <= this.creditLimit;
// };

// // Static method to find customers with outstanding balances
// customerSchema.statics.findWithOutstandingBalance = function(shopId) {
//     return this.find({
//         shopId: shopId,
//         isActive: true,
//         currentBalance: { $gt: 0 }
//     });
// };