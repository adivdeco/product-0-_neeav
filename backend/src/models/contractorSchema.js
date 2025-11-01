
const mongoose = require('mongoose');
const { Schema } = mongoose;

const contractorSchema = new Schema({
    contractorName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
    },
    contractorId: {
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
        phone: {
            type: String,
            required: true,
            // unique: true,
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
    services: [{
        type: String,
        enum: [
            'Masonry',
            'Plumbing',
            'Electrical',
            'Carpentry',
            'Painting',
            'Flooring',
            'Roofing',
            'Structural',
            'Labor Supply',
            'Construction',
            'Renovation',
            'Demolition',
            'Landscaping',
            'HVAC',
            'Welding'
        ]
    }],
    experience: {
        years: {
            type: Number,
            min: 0
        },
        description: String
    },
    availability: {
        type: String,
        enum: ['available', 'busy', 'on-leave'],
        default: 'available'
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
        },
        reviews: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                required: true,
                maxlength: 500
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    pricing: {
        hourlyRate: Number,
        dailyRate: Number,
        projectRate: String // Fixed price or negotiable
    },
    documents: [{
        type: {
            type: String,
            enum: ['license', 'certificate', 'insurance', 'id-proof']
        },
        documentNumber: String,
        fileUrl: String,
        verified: {
            type: Boolean,
            default: false
        },
        expiryDate: Date
    }],
    images: [{
        url: String,
        caption: String,
        type: {
            type: String,
            enum: ['profile', 'work-sample', 'license']
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

contractorSchema.virtual('formattedAddress').get(function () {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

contractorSchema.index({ contractorName: 1 });
contractorSchema.index({ 'contact.phone': 1 });
contractorSchema.index({ services: 1 });
contractorSchema.index({ 'address.city': 1, 'address.state': 1 });

const Contractor = mongoose.model('Contractor', contractorSchema);
module.exports = Contractor;