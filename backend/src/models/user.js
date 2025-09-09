const mongoose = require('mongoose');
const { Schema } = mongoose;


const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },

    phone: {
        type: String,
        required: true,
        unique: true,
    },

    passwordHash: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["customer", "store_owner", "contractor", "admin"],
        default: "customer",
    },

    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
    },

    // ✅ For store owners
    storeDetails: {
        storeName: String,
        gstNumber: String,
        licenseId: String,
        isVerified: { type: Boolean, default: false },
    },

    // ✅ For contractors
    contractorDetails: {
        specialization: [String], // e.g., ["plumbing", "electrical", "masonry"]
        yearsOfExperience: Number,
        rating: { type: Number, default: 0 },
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
export default User;
