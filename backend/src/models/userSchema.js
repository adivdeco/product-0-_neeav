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

    // phone: {
    //     type: String,
    //     validate: {
    //         validator: function (v) {
    //             return /^[6-9]\d{9}$/.test(v);
    //         },
    //         message: props => `${props.value} is not a valid Indian phone number!`
    //     }
    // },

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

    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        // pincode: {
        //     type: String,
        //     validate: {
        //         validator: function (v) {
        //             return /^\d{6}$/.test(v);
        //         },
        //         message: props => `${props.value} is not a valid pincode!`
        //     }
        // },
        country: { type: String, default: "In, Bihar 821115" },

    },

    // ✅ For store owners
    storeDetails: {
        storeName: String,
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
        skills: [String],
        bio: String
    },

    avatar: {
        type: String,
        default: '',
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });



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