const express = require('express')
const { addNewBills, updateBill, deleateBill, getBill, getAllBills } = require('../controllers/billManager');
const Shop = require('../models/shopSchema');
const Customer = require('../models/customerSchema');
const billsRouter = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')


billsRouter.post('/add_bill', authMiddleware, addNewBills)
billsRouter.put('/update_bill/:billId', authMiddleware, updateBill);
billsRouter.delete('/delete_bill/:billId', authMiddleware, deleateBill)




billsRouter.get('/find/:billId', authMiddleware, getBill)
billsRouter.get('/allBills', authMiddleware, getAllBills)



billsRouter.get('/customer', authMiddleware, async (req, res) => {

    try {
        const userId = req.finduser._id;
        const role = req.finduser.role;

        if (role !== 'store_owner' && role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: You do not have access to view bills"
            });
        }

        const shop = await Shop.findOne({ ownerId: userId });
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found for this user"
            });
        }
        const shopId = req.query.shopId || shop._id;
        if (!shopId) {
            return res.status(400).json({ message: "Shop ID is required" });
        }

        const customers = await Customer.find({ shopId: shopId }).sort({ name: 1 }).lean();
        if (!customers || customers.length === 0) {
            return res.status(404).json({
                message: "No customers found for this shop"
            });
        }
        if (!customers.length) {
            return res.status(200).json({
                message: "No customers found for this shop",
                customers: []
            });
        }

        res.status(200).json({
            message: "Customers fetched successfully",
            count: customers.length,
            customers: customers
        });

    } catch (error) {
        console.error("Error fetching customers:", error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Invalid ID format"
            });
        }

        res.status(500).json({
            message: "Internal server error while fetching customers"
        });
    }
})

billsRouter.get('/customer/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.finduser._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Customer ID" });
        }

        const customer = await Customer.findById(id).lean();
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Verify the customer belongs to user's shop
        const shop = await Shop.findOne({
            _id: customer.shopId,
            ownerId: userId
        });

        if (!shop) {
            return res.status(403).json({
                message: "Access denied to this customer"
            });
        }

        // Get customer's bills summary
        const billsSummary = await Bills.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(id),
                    status: 'active'
                }
            },
            {
                $group: {
                    _id: '$paymentStatus',
                    totalAmount: { $sum: '$grandTotal' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            message: "Customer details fetched successfully",
            customer: customer,
            billsSummary: billsSummary
        });

    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


billsRouter.get('/customer/search', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.finduser._id;

        if (!query || query.length < 2) {
            return res.status(400).json({
                message: "Search query must be at least 2 characters long"
            });
        }

        const shop = await Shop.findOne({ ownerId: userId });
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        const customers = await Customer.find({
            shopId: shop._id,
            isActive: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('name phone email currentBalance')
            .limit(10)
            .lean();

        res.status(200).json({
            message: "Search completed successfully",
            results: customers
        });

    } catch (error) {
        console.error("Error searching customers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = billsRouter
