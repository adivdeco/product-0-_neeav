const mongoose = require('mongoose');
const Bills = require('../models/billsSchema');
const Customer = require('../models/customerSchema');
const Shop = require('../models/shopSchema'); // Assuming you have a Shop model


const addNewBills = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.session.userId;
        const role = req.session.role;

        if (role !== 'store_owner' && role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: You do not have access to add bills"
            });
        }

        // Find shop by ownerId
        const shop = await Shop.findOne({ ownerId: userId }).session(session);
        if (!shop) {
            return res.status(400).json({
                message: "Shop not found for this user"
            });
        }

        const shopId = shop._id;
        // console.log(shop.ownerId, "ownerId");
        // console.log(shopId, "shopid");

        const {
            customerName,
            items,
            totalAmount,
            grandTotal,
            amountPaid,
            phone,
            email,
            address
        } = req.body;

        // Validate required fields
        if (!customerName || !items || !totalAmount || !grandTotal) {
            return res.status(400).json({
                message: "Missing required fields: customerName, items, totalAmount, and grandTotal are required"
            });
        }

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Items must be a non-empty array"
            });
        }

        // Validate amounts
        if (totalAmount < 0 || grandTotal < 0) {
            return res.status(400).json({
                message: "Amounts cannot be negative"
            });
        }

        let customerId;

        // Find or create customer
        if (phone) {
            let customer = await Customer.findOne({ phone, shopId }).session(session);

            if (!customer) {
                // Create new customer WITH shopId
                customer = new Customer({
                    shopId, // ✅ FIXED: Added shopId here
                    name: customerName,
                    phone: phone,
                    email: email || '',
                    address: address || {},
                    createdBy: userId
                });

                await customer.save({ session });
            }

            customerId = customer._id;

            // Update customer balance if it's a credit bill
            if (req.body.isCredit) {
                customer.currentBalance += (grandTotal) - (amountPaid);
                await customer.save({ session });
            }


        }

        // Generate unique bill number
        const billNumber = generateBillNumber();

        // Calculate additional fields if not provided
        const discount = req.body.discount || 0;
        const taxAmount = req.body.taxAmount || 0;
        // const amountPaid = req.body.amountPaid || 0;

        // Validate payment status logic
        let paymentStatus = req.body.paymentStatus || 'pending';
        if (amountPaid >= grandTotal) {
            paymentStatus = 'paid';
        } else if (amountPaid > 0) {
            paymentStatus = 'partial';
        }

        const newBill = new Bills({
            shopId,
            customerId: customerId || null,
            customerName,
            customerPhone: phone,
            customerEmail: email,
            billNumber,
            items: items.map(item => ({
                // productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unit: item.unit || 'pcs',
                price: item.price,
                discount: item.discount || 0,
                taxRate: item.taxRate || 0
            })),
            totalAmount,
            discount,
            taxAmount,
            grandTotal,
            amountPaid,
            paymentStatus,
            paymentMethod: req.body.paymentMethod || 'cash',
            isCredit: req.body.isCredit || true,
            creditPeriod: req.body.creditPeriod,
            creditInterestRate: req.body.creditInterestRate,
            deliveryCharge: req.body.deliveryCharge || 0,
            packagingCharge: req.body.packagingCharge || 0,
            notes: req.body.notes,
            referenceNumber: req.body.referenceNumber,
            dueDate: req.body.dueDate,
            createdBy: userId
        });

        await newBill.save({ session });
        await session.commitTransaction();

        // Populate the bill with customer details before sending response
        const populatedBill = await Bills.findById(newBill._id)
            .populate('customerId', 'name phone email')
            .populate('shopId', 'shopName address');

        res.status(201).json({
            message: "Bill created successfully",
            bill: populatedBill
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in adding new bill:', error);

        if (error.code === 11000 && error.keyPattern && error.keyPattern.billNumber) {
            return res.status(400).json({
                message: "Bill number already exists. Please try again."
            });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: "Validation error",
                errors
            });
        }

        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};




const updateBill = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.session.userId;
        const role = req.session.role;

        if (role !== 'store_owner' && role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: You do not have access to add bills"
            });
        }
        const { billId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(billId)) {
            return res.status(400).json({ message: "Invalid bill ID" });
        }

        const bill = await Bills.findById(billId).session(session);
        if (!bill) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Bill not found" });
        }

        // Check if user has access to this bill's shop
        // You might want to add additional authorization checks here

        // Prevent updating certain fields
        const allowedUpdates = [
            'paymentStatus', 'amountPaid', 'paymentMethod', 'notes',
            'referenceNumber', 'status', 'dueDate'
        ];

        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid updates! Only certain fields can be updated"
            });
        }

        // Handle payment updates
        if (req.body.amountPaid !== undefined) {
            if (req.body.amountPaid > bill.grandTotal) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: "Amount paid cannot exceed grand total"
                });
            }

            // Update payment status based on amount paid
            if (req.body.amountPaid >= bill.grandTotal) {
                req.body.paymentStatus = 'paid';
            } else if (req.body.amountPaid > 0) {
                req.body.paymentStatus = 'partial';
            } else {
                req.body.paymentStatus = 'pending';
            }
        }

        updates.forEach(update => bill[update] = req.body[update]);
        bill.updatedBy = userId;

        await bill.save({ session });
        await session.commitTransaction();

        const updatedBill = await Bills.findById(billId)
            .populate('customerId', 'name phone email')
            .populate('shopId', 'name address');

        res.json({
            message: "Bill updated successfully",
            bill: updatedBill
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in updating bill:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        session.endSession();
    }
};

const deleateBill = async (req, res) => {
    try {

        const userId = req.session.userId
        const role = req.session.role



        if (role != 'store_owner' && role != "admin") {
            return res.status(403).send("Forbidden: You do not have asses to addShop ")
        }


        const { billId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(billId)) {
            return res.status(400).json({ message: "Invalid bill ID" });
        }

        const bill = await Bills.findByIdAndDelete(billId);
        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        res.json({
            message: "Bill delated successfully"
        });

    } catch (error) {
        console.error('Error in deleting bill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getBill = async (req, res) => {
    try {

        const userId = req.session.userId;
        const role = req.session.role;

        if (role !== 'store_owner' && role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: You do not have access to add bills"
            });
        }

        const { billId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(billId)) {
            return res.status(400).json({ message: "Invalid bill ID" });
        }


        const bill = await Bills.findById(billId)
            .populate('customerId', 'name phone email address')
            .populate('shopId', 'name address phone')
        // .populate('items.productId', 'name sku category');

        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        res.json({
            message: "Bill retrieved successfully",
            bill
        });

    } catch (error) {
        console.error('Error in getting bill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllBills = async (req, res) => {
    try {
        const userId = req.session.userId;
        const role = req.session.role;

        if (role !== 'store_owner' && role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: You do not have access to view bills"
            });
        }

        // Find the shop for this user
        const shop = await Shop.findOne({ ownerId: userId });
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found for this user"
            });
        }

        // Use shopId from query if provided, else use found shop's id
        const shopId = req.query.shopId || shop._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { status, paymentStatus, startDate, endDate } = req.query;

        if (!shopId) {
            return res.status(400).json({ message: "Shop ID is required" });
        }

        // Build filter
        const filter = { shopId };
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (startDate || endDate) {
            filter.billDate = {};
            if (startDate) filter.billDate.$gte = new Date(startDate);
            if (endDate) filter.billDate.$lte = new Date(endDate);
        }

        // Pagination options
        const options = {
            page,
            limit,
            sort: { billDate: -1 },
            populate: [
                { path: 'customerId', select: 'name phone' },
                { path: 'shopId', select: 'shopName' }
            ]
        };

        const bills = await Bills.paginate(filter, options);

        res.json({
            message: "Bills retrieved successfully",
            bills: bills.docs,
            pagination: {
                page: bills.page,
                totalPages: bills.totalPages,
                totalBills: bills.totalDocs,
                hasNext: bills.hasNextPage,
                hasPrev: bills.hasPrevPage
            }
        });

    } catch (error) {
        console.error('Error in getting all bills:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};




// Helper function to generate bill number
const generateBillNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000);

    return `BILL-${day}${month}${year}-${hours}${minutes}${seconds}-${random}`;
};



module.exports = { addNewBills, updateBill, deleateBill, getBill, getAllBills }
