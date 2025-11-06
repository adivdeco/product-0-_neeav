// models/ServiceRequest.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const serviceRequestSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contractorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    projectType: {
        type: String,
        required: true
    },
    workDescription: {
        type: String,
        required: true
    },
    // budgetRange: {
    //     type: String,
    //     required: true
    // },
    timeline: {
        type: String,
        required: true
    },
    startDate: Date,
    address: {
        type: String,
        required: true
    },
    specialRequirements: String,
    urgency: {
        type: String,
        enum: ["low", "normal", "high", "urgent"],
        default: "normal"
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending"
    },
    contractorName: String,
    customerName: String,
    customerPhone: String,
    customerEmail: String
}, { timestamps: true });

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);
module.exports = ServiceRequest