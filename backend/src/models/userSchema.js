const mongoose = require('mongoose');
const { Schema } = mongoose;


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    phone: {
        type: String,
        default: null,
    },


    password: {
        type: String,
        required: true,
        minLength: 4
    },

    role: {
        type: String,
        enum: ["User", "store_owner", "contractor", "co-admin", "admin"],
        default: "User",
    },

    // address: {
    //     street: String,
    //     city: String,
    //     state: String,
    //     pincode: String,

    //     country: { type: String, default: "In, Bihar 821115" },

    // },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
        landmark: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        isDefault: { type: Boolean, default: true }
    },
    addresses: [{
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
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        isDefault: { type: Boolean, default: false },
        contactPerson: String,
        contactPhone: String,
        instructions: String
    }],
    // ✅ For store owners
    storeDetails: {
        storeName: String,
        StoreId: {
            type: Schema.Types.ObjectId,
            ref: 'Shop',
            default: null
        },
        gstNumber: String,
        licenseId: String,
        isVerified: { type: Boolean, default: false },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        productCategories: [{
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
    },

    // ✅ For contractors
    contractorDetails: {
        specialization: [{
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
        yearsOfExperience: {
            type: Number,
            min: 0
        },
        hourlyRate: Number,
        licenseNumber: String,
        isVerified: {
            type: Boolean,
            default: false
        },
        totalProjects: {
            type: Number,
            default: 0
        },
        completedProjects: {
            type: Number,
            default: 0
        },
        availability: {
            type: String,
            enum: ['available', 'busy', 'on-leave'],
            default: 'available'
        },
        currentWork: {
            type: Schema.Types.ObjectId,
            ref: 'WorkRequest'
        },
        skills: [String],
        bio: String
    },

    purchasePreferences: {
        defaultPaymentMethod: {
            type: String,
            enum: ['cash_on_delivery', 'online_payment', 'bank_transfer'],
            default: 'cash_on_delivery'
        },
        saveAddress: { type: Boolean, default: true },
        receiveSmsUpdates: { type: Boolean, default: true },
        preferredDeliveryTime: {
            type: String,
            enum: ['morning', 'afternoon', 'evening', 'anytime'],
            default: 'anytime'
        }
    },

    avatar: {
        type: String,
        default: '',
    },

    fcmToken: {
        type: String,
        default: null,
    },

    cart: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
    }],




    createdAt: {
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

userSchema.methods.addAddress = function (addressData) {
    // If this is set as default, remove default from others
    if (addressData.isDefault) {
        this.addresses.forEach(addr => addr.isDefault = false);
    }
    this.addresses.push(addressData);
    return this.save();
};

// Method to set default address
userSchema.methods.setDefaultAddress = function (addressId) {
    this.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId.toString();
    });
    return this.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;



// for extra security we can add extra hash on pass stores hear 



// Hash password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     try {
//         const salt = await bcrypt.genSalt(12);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // Compare password method
// userSchema.methods.comparePassword = async function (candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// // Virtual for full address
// userSchema.virtual('fullAddress').get(function () {
//     return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}, ${this.address.country}`;
// });

// const User = mongoose.model("User", userSchema);
// module.exports = User;