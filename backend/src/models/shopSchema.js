const mongoose = require('mongoose');
const { Schema } = mongoose;

// Shop Schema
const shopSchema = new Schema({
    // Basic shop information
    shopName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
        // unique: true
    },
    ownerName: {
        type: String,
        required: true,
    },

    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    description: {
        type: String,
        maxLength: 500
    },

    contact: {
        email: {
            type: String,
            lowercase: true,
            unique: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },

        // password: {
        //     type: String,
        //     required: true,
        //     minLength: 4
        // },

        phone: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^[6-9]\d{9}$/.test(v);
                },
                message: props => `${props.value} is not a valid Indian phone number!`
            }
        },
        alternatePhone: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^[6-9]\d{9}$/.test(v);
                },
                message: props => `${props.value} is not a valid Indian phone number!`
            }
        }
    },

    // Address information
    address: {
        street: String,
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        landmark: String
    },

    // Business information
    // gstNumber: {
    //     type: String,
    //     uppercase: true,
    //     match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
    // },
    // businessType: {
    //     type: String,
    //     enum: ['Proprietorship', 'Partnership', 'LLP', 'Private Limited'],
    //     default: 'Proprietorship'
    // },


    // Shop specialization


    categories: [{
        type: String,
        enum: [
            'Cement & Concrete',
            'Bricks & Blocks',
            'Steel & Reinforcement',
            'Sand & Aggregates',
            'Paints & Finishes',
            'Tools & Equipment',
            'Plumbing',
            'Electrical',
            'Tiles & Sanitary',
            'Hardware & Fittings'
        ]
    }],

    // Business hours
    businessHours: {
        open: {
            type: String,
            default: '09:00'
        },
        close: {
            type: String,
            default: '18:00'
        },
        workingDays: {
            type: [String],
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        }
    },

    // Financial information
    currency: {
        type: String,
        default: 'INR'
    },

    taxRate: {
        type: Number,
        default: 18 // Default GST rate
    },

    // User account reference (who created this shop)
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },

    // images: [{
    //     url: String,
    //     caption: String,
    //     isPrimary: {
    //         type: Boolean,
    //         default: false
    //     }
    // }],
    avatar: {
        type: String,
        default: ""
    },

    images: [{
        type: String,
        default: ""
    }],


    // Status
    isActive: {
        type: Boolean,
        default: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

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
shopSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for formatted address
shopSchema.virtual('formattedAddress').get(function () {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

// Index for better query performance
// shopSchema.index({ name: 1 });
// shopSchema.index({ city: 1, state: 1 });
// shopSchema.index({ userId: 1 });
// Index for better query performance
shopSchema.index({ name: 'text', description: 'text' });
shopSchema.index({ 'address.city': 1, 'address.state': 1 });
shopSchema.index({ ownerId: 1 });
shopSchema.index({ categories: 1 });

const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;