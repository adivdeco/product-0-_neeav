const mongoose = require('mongoose');
const { Schema } = mongoose;


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        // maxLenghth: 10,
        trim: true,
        lowercase: true,
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
        enum: ["nUser", "store_owner", "contractor", "co-admin", "admin"],
        default: "nUser",
    },

    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "In, Bihar 821115" },

    },

    // ✅ For store owners
    storeDetails: {
        storeName: String,
        gstNumber: String,
        licenseId: String,
        isVerified: { type: Boolean, default: false },
        rating: { type: Number, default: 0 },
        productCategories: [String], // e.g., ["cement", "bricks", "steel"],
    },

    // ✅ For contractors
    contractorDetails: {
        specialization: [String], // e.g., ["plumbing", "electrical", "masonry"]
        yearsOfExperience: Number,
        rating: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: false },

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
