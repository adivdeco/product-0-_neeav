// routes/serviceRequestRoutes.js
const express = require("express");
const notifyDataRouter = express.Router();
const ServiceRequest = require("../models/ServiceRequest");

// Update service request status
notifyDataRouter.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actionTakenAt } = req.body;

        const serviceRequest = await ServiceRequest.findByIdAndUpdate(
            id,
            {
                status,
                actionTakenAt: actionTakenAt || new Date()
            },
            { new: true }
        );

        if (!serviceRequest) {
            return res.status(404).json({ success: false, error: "Service request not found" });
        }

        res.json({ success: true, serviceRequest });
    } catch (error) {
        console.error("Error updating service request:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

notifyDataRouter.get("/contractor/:contractorId", async (req, res) => {
    try {
        const { contractorId } = req.params;
        const { status } = req.query;

        const filter = { contractorId };
        if (status) filter.status = status;

        const serviceRequests = await ServiceRequest.find(filter)
            .sort({ createdAt: -1 })
            .populate('customerId', 'name email phone');

        res.json({ success: true, serviceRequests });
    } catch (error) {
        console.error("Error fetching service requests:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Add this to your serviceRequestRoutes.js
notifyDataRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const serviceRequest = await ServiceRequest.findById(id);

        if (!serviceRequest) {
            return res.status(404).json({ success: false, error: "Service request not found" });
        }

        res.json({ success: true, serviceRequest });
    } catch (error) {
        console.error("Error fetching service request:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = notifyDataRouter;