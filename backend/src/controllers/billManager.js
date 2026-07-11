const mongoose = require('mongoose');
const Bills = require('../models/billsSchema');
const Customer = require('../models/customerSchema');
const Shop = require('../models/shopSchema');
const PaymentRecord = require('../models/paymentRecordSchema');
const PastRecord = require('../models/pastRecordSchema');


const addNewBills = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.finduser._id;
        const role = req.finduser.role;

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

        const {
            customerName,
            items,
            totalAmount,
            grandTotal,
            amountPaid,
            phone,
            email,
            address,
            date  // This is from frontend form
        } = req.body;

        // ✅ DEBUG: Check what address is received
        console.log('Received address from frontend:', address);


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
        let customer = null;

        // Find or create customer
        if (phone || customerName) {
            // Primary lookup: by phone (if provided and non-empty)
            if (phone && phone.trim() !== '') {
                customer = await Customer.findOne({ phone: phone.trim(), shopId }).session(session);
            }

            // Fallback lookup: by name + shopId (if phone didn't match or wasn't provided)
            if (!customer && customerName) {
                customer = await Customer.findOne({ name: customerName.trim(), shopId }).session(session);
            }

            if (!customer) {
                // Create new customer WITH shopId
                customer = new Customer({
                    shopId,
                    name: customerName,
                    phone: phone || '',
                    email: email || '',
                    address: address || '',
                    createdBy: userId
                });

                await customer.save({ session });
            } else {
                // Update existing customer details if currently empty
                let needsUpdate = false;
                if (email && !customer.email) {
                    customer.email = email;
                    needsUpdate = true;
                }
                if (address && !customer.address) {
                    customer.address = address;
                    needsUpdate = true;
                }
                if (phone && !customer.phone) {
                    customer.phone = phone;
                    needsUpdate = true;
                }
                if (needsUpdate) {
                    await customer.save({ session });
                }
            }

            customerId = customer._id;

            // Update customer balance if it's a credit bill
            if (req.body.isCredit) {
                const billDue = grandTotal - amountPaid;

                // Auto-apply advance credit if customer has advance (negative balance)
                if (customer.currentBalance < 0 && billDue > 0) {
                    const availableAdvance = Math.abs(customer.currentBalance);
                    const advanceToApply = Math.min(availableAdvance, billDue);

                    // This will be added to amountPaid when creating the bill below
                    req.body._advanceApplied = advanceToApply;
                }

                // Net effect on balance is simply: grandTotal - amountPaid (billDue)
                // The running balance automatically handles any existing negative advance balance
                customer.currentBalance += billDue;
                await customer.save({ session });
            }
        }

        // Generate unique bill number
        const billNumber = generateBillNumber();

        // Calculate additional fields if not provided
        const discount = req.body.discount || 0;
        const taxAmount = req.body.taxAmount || 0;

        // Validate payment status logic
        // Apply advance credit to amountPaid if applicable
        const advanceApplied = req.body._advanceApplied || 0;
        const effectiveAmountPaid = amountPaid + advanceApplied;

        let paymentStatus = req.body.paymentStatus || 'pending';
        if (effectiveAmountPaid >= grandTotal) {
            paymentStatus = 'paid';
        } else if (effectiveAmountPaid > 0) {
            paymentStatus = 'partial';
        }


        const selectedDate = date ? new Date(date) : new Date();



        const newBill = new Bills({
            shopId,
            customerId: customerId || null,
            customerName,
            customerPhone: phone,
            customerEmail: email,
            billNumber: billNumber,
            billDate: selectedDate, // ✅ Use the selected date
            items: items.map(item => ({
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
            amountPaid: effectiveAmountPaid,
            paymentStatus,
            paymentMethod: req.body.paymentMethod || 'cash',
            isCredit: req.body.isCredit ?? true,
            creditPeriod: req.body.creditPeriod,
            creditInterestRate: req.body.creditInterestRate,
            deliveryCharge: req.body.deliveryCharge || 0,
            packagingCharge: req.body.packagingCharge || 0,
            notes: req.body.notes,
            referenceNumber: req.body.referenceNumber,
            dueDate: req.body.dueDate,
            date: selectedDate, // ✅ Use the same selected date
            createdBy: userId
        });

        // // ✅ DEBUG: Check the bill object before saving
        // console.log('Bill object before save:', {
        //     billNumber: newBill.billNumber,
        //     billDate: newBill.billDate,
        //     date: newBill.date,
        //     customerName: newBill.customerName
        // });

        await newBill.save({ session });

        // Create a PaymentRecord if there was an actual cash/UPI/card payment at purchase
        if (customerId && amountPaid > 0) {
            const paymentRecord = new PaymentRecord({
                shopId: shop._id,
                customerId: customerId,
                billId: newBill._id,
                billAllocations: [{
                    billId: newBill._id,
                    billNumber: newBill.billNumber,
                    amount: amountPaid
                }],
                amount: amountPaid,
                paymentMethod: newBill.paymentMethod || 'cash',
                notes: `Initial payment for Bill #${newBill.billNumber ? newBill.billNumber.slice(-8) : ''}`,
                balanceAfter: customer ? customer.currentBalance : 0,
                date: newBill.billDate || new Date(),
                createdBy: userId
            });
            await paymentRecord.save({ session });
        }

        await session.commitTransaction();

        // ✅ DEBUG: Check the saved bill
        // const savedBill = await Bills.findById(newBill._id);
        // console.log('Bill saved successfully:', {
        //     billDate: savedBill.billDate,
        //     date: savedBill.date,
        //     _id: savedBill._id
        // });

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
        console.error('Error details:', error.message);

        if (error.name === 'ValidationError') {
            console.error('Validation errors:', error.errors);
        }

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
}


const updateBill = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.finduser._id;
        const role = req.finduser.role;

        if (role !== 'store_owner' && role !== "admin") {
            await session.abortTransaction();
            return res.status(403).json({
                message: "Forbidden: You do not have access to update bills"
            });
        }

        const { billId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(billId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid bill ID" });
        }

        const bill = await Bills.findById(billId).session(session);
        if (!bill) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Bill not found" });
        }

        // Check if user has access to this bill's shop
        const shop = await Shop.findOne({ ownerId: userId }).session(session);
        if (!shop || !bill.shopId.equals(shop._id)) {
            await session.abortTransaction();
            return res.status(403).json({
                message: "Forbidden: You don't have access to this bill"
            });
        }

        // Allowed fields for update
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

        // Store old values for customer balance calculation
        const oldAmountPaid = bill.amountPaid;
        const oldPaymentStatus = bill.paymentStatus;

        // Handle payment updates
        if (req.body.amountPaid !== undefined) {
            const newAmountPaid = parseFloat(req.body.amountPaid);

            if (newAmountPaid > bill.grandTotal) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: "Amount paid cannot exceed grand total"
                });
            }

            // Update payment status based on amount paid
            if (newAmountPaid >= bill.grandTotal) {
                req.body.paymentStatus = 'paid';
            } else if (newAmountPaid > 0) {
                req.body.paymentStatus = 'partial';
            } else {
                req.body.paymentStatus = 'pending';
            }

            // Update customer balance if it's a credit bill
            if (bill.isCredit && bill.customerId) {
                const customer = await Customer.findById(bill.customerId).session(session);
                if (customer) {
                    const paymentDiff = newAmountPaid - oldAmountPaid;
                    // Reduce customer balance by the increase in amount paid
                    customer.currentBalance -= paymentDiff;
                    await customer.save({ session });

                    // Create a PaymentRecord for the audit trail if amount increased
                    if (paymentDiff > 0) {
                        const paymentRecord = new PaymentRecord({
                            shopId: bill.shopId,
                            customerId: bill.customerId,
                            billId: bill._id,
                            billAllocations: [{
                                billId: bill._id,
                                billNumber: bill.billNumber,
                                amount: paymentDiff
                            }],
                            amount: paymentDiff,
                            paymentMethod: req.body.paymentMethod || bill.paymentMethod || 'cash',
                            notes: `Payment update for Bill #${bill.billNumber ? bill.billNumber.slice(-8) : ''}`,
                            balanceAfter: customer.currentBalance,
                            date: new Date(),
                            createdBy: userId
                        });
                        await paymentRecord.save({ session });
                    }
                }
            }
        }

        // Apply updates
        updates.forEach(update => {
            bill[update] = req.body[update];
        });

        bill.updatedBy = userId;
        bill.updatedAt = new Date();

        await bill.save({ session });
        await session.commitTransaction();

        const updatedBill = await Bills.findById(billId)
            .populate('customerId', 'name phone email')
            .populate('shopId', 'shopName address');

        res.json({
            message: "Bill updated successfully",
            bill: updatedBill
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in updating bill:', error);

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

const deleateBill = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.finduser._id;
        const role = req.finduser.role;

        if (role !== 'store_owner' && role !== "admin") {
            await session.abortTransaction();
            return res.status(403).send("Forbidden: You do not have access to delete bills");
        }

        const { billId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(billId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid bill ID" });
        }

        const bill = await Bills.findById(billId).session(session);
        if (!bill) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Bill not found" });
        }

        // Check if user has access to this bill's shop
        const shop = await Shop.findOne({ ownerId: userId }).session(session);
        if (!shop || !bill.shopId.equals(shop._id)) {
            await session.abortTransaction();
            return res.status(403).json({
                message: "Forbidden: You don't have access to this bill"
            });
        }

        // Update customer balance — reverse the full outstanding due for this bill
        if (bill.isCredit && bill.customerId) {
            const customer = await Customer.findById(bill.customerId).session(session);
            if (customer) {
                // Reverse only the remaining due (grandTotal - amountPaid)
                // The payments that contributed to amountPaid already reduced the balance
                const billDue = bill.grandTotal - bill.amountPaid;
                customer.currentBalance -= billDue;
                await customer.save({ session });
            }
        }

        // ── Cascade-clean payment records ──

        // 1. Delete payment records that were created specifically for this bill (initial payments)
        await PaymentRecord.deleteMany({ billId: bill._id }).session(session);

        // 2. Clean up payment records that have this bill in billAllocations
        //    (from recordPayment — distributed payments across multiple bills)
        const distributedPayments = await PaymentRecord.find({
            'billAllocations.billId': bill._id
        }).session(session);

        for (const payment of distributedPayments) {
            // Remove this bill's allocation from the payment
            payment.billAllocations = payment.billAllocations.filter(
                alloc => !alloc.billId.equals(bill._id)
            );

            if (payment.billAllocations.length === 0 && !payment.billId) {
                // No allocations left and no direct billId — delete the orphaned record
                await PaymentRecord.findByIdAndDelete(payment._id).session(session);
            } else {
                // Still has other allocations — save the updated record
                await payment.save({ session });
            }
        }

        // Delete the bill
        await Bills.findByIdAndDelete(billId).session(session);

        await session.commitTransaction();
        res.json({
            message: "Bill deleted successfully"
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in deleting bill:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        session.endSession();
    }
};

const getBill = async (req, res) => {
    try {

        const userId = req.finduser._id;
        const role = req.finduser.role;

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
        const userId = req.finduser._id;
        const role = req.finduser.role;

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


// ─── Record Payment (customer-level, creates payment record, auto-distributes to bills) ───
const recordPayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.finduser._id;
        const role = req.finduser.role;

        if (role !== 'store_owner' && role !== 'admin') {
            await session.abortTransaction();
            return res.status(403).json({
                message: "Forbidden: You do not have access to record payments"
            });
        }

        const { customerId } = req.params;
        const { paymentAmount, paymentMethod, notes } = req.body;

        // Validate customerId
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid customer ID" });
        }

        // Validate payment amount
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Payment amount must be greater than 0" });
        }

        // Find customer
        const customer = await Customer.findById(customerId).session(session);
        if (!customer) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Customer not found" });
        }

        // Verify shop ownership
        const shop = await Shop.findOne({ ownerId: userId }).session(session);
        if (!shop || !customer.shopId.equals(shop._id)) {
            await session.abortTransaction();
            return res.status(403).json({
                message: "Forbidden: You don't have access to this customer"
            });
        }

        // Auto-distribute payment to oldest unpaid bills
        let remainingPayment = amount;
        const updatedBills = [];

        if (remainingPayment > 0) {
            // Get unpaid bills sorted by oldest first
            const unpaidBills = await Bills.find({
                customerId: new mongoose.Types.ObjectId(customerId),
                shopId: shop._id,
                paymentStatus: { $in: ['pending', 'partial'] }
            }).sort({ billDate: 1, createdAt: 1 }).session(session);

            for (const bill of unpaidBills) {
                if (remainingPayment <= 0) break;

                const billDue = bill.grandTotal - bill.amountPaid;
                if (billDue <= 0) continue;

                const applyToBill = Math.min(remainingPayment, billDue);
                bill.amountPaid += applyToBill;
                remainingPayment -= applyToBill;

                if (bill.amountPaid >= bill.grandTotal) {
                    bill.paymentStatus = 'paid';
                } else {
                    bill.paymentStatus = 'partial';
                }

                bill.updatedBy = userId;
                bill.updatedAt = new Date();
                await bill.save({ session });
                updatedBills.push({
                    billId: bill._id,
                    billNumber: bill.billNumber,
                    applied: applyToBill,
                    newStatus: bill.paymentStatus
                });
            }
        }

        // Update customer balance
        const oldBalance = customer.currentBalance;
        customer.currentBalance -= amount;
        await customer.save({ session });

        // Create payment record with bill allocations
        const paymentRecord = new PaymentRecord({
            shopId: shop._id,
            customerId: customer._id,
            amount,
            paymentMethod: paymentMethod || 'cash',
            notes: notes || '',
            balanceAfter: customer.currentBalance,
            billAllocations: updatedBills.map(b => ({
                billId: b.billId,
                billNumber: b.billNumber,
                amount: b.applied
            })),
            date: new Date(),
            createdBy: userId
        });
        await paymentRecord.save({ session });

        await session.commitTransaction();

        // Build response message
        let message = `Payment of \u20b9${amount} recorded successfully.`;
        if (customer.currentBalance < 0) {
            message += ` Customer has \u20b9${Math.abs(customer.currentBalance)} advance credit.`;
        } else if (customer.currentBalance > 0) {
            message += ` Remaining due: \u20b9${customer.currentBalance}.`;
        } else {
            message += ' All dues cleared!';
        }

        res.json({
            message,
            payment: paymentRecord,
            previousBalance: oldBalance,
            currentBalance: customer.currentBalance,
            updatedBills
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error recording payment:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};


// ─── Archive & Clear Customer Records ───
const archiveAndClearCustomer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.finduser._id;
        const role = req.finduser.role;

        if (role !== 'store_owner' && role !== 'admin') {
            await session.abortTransaction();
            return res.status(403).json({
                message: "Forbidden: You do not have access to archive records"
            });
        }

        const { customerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid customer ID" });
        }

        // Find customer
        const customer = await Customer.findById(customerId).session(session);
        if (!customer) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Customer not found" });
        }

        // Verify shop ownership
        const shop = await Shop.findOne({ ownerId: userId }).session(session);
        if (!shop || !customer.shopId.equals(shop._id)) {
            await session.abortTransaction();
            return res.status(403).json({
                message: "Forbidden: You don't have access to this customer"
            });
        }

        // Check that customer balance is cleared (0 or advance/negative)
        if (customer.currentBalance > 0) {
            await session.abortTransaction();
            return res.status(400).json({
                message: `Customer still has ₹${customer.currentBalance} outstanding. Clear all dues before archiving.`,
                currentBalance: customer.currentBalance
            });
        }

        // Fetch all bills for this customer
        const bills = await Bills.find({
            customerId: new mongoose.Types.ObjectId(customerId),
            shopId: shop._id
        }).sort({ billDate: 1, createdAt: 1 }).session(session);

        if (!bills || bills.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "No bills found for this customer to archive"
            });
        }

        // Fetch all payment records for this customer
        const payments = await PaymentRecord.find({
            customerId: new mongoose.Types.ObjectId(customerId),
            shopId: shop._id
        }).sort({ date: 1, createdAt: 1 }).session(session);

        // Determine cycle number
        const existingCycles = await PastRecord.countDocuments({
            customerId: new mongoose.Types.ObjectId(customerId),
            shopId: shop._id
        }).session(session);
        const cycleNumber = existingCycles + 1;

        // Generate statement number
        const statementNumber = generateStatementNumber();

        // ── Build compact bill snapshots ──
        const billSnapshots = bills.map(bill => ({
            billNumber: bill.billNumber,
            billDate: bill.billDate || bill.createdAt,
            items: (bill.items || []).map(item => ({
                productName: item.productName,
                quantity: item.quantity,
                unit: item.unit || 'pcs',
                price: item.price,
                discount: item.discount || 0,
            })),
            totalAmount: bill.totalAmount,
            grandTotal: bill.grandTotal,
            discount: bill.discount || 0,
            notes: bill.notes || '',
        }));

        // ── Build compact payment snapshots ──
        const paymentSnapshots = payments.map(payment => ({
            amount: payment.amount,
            paymentMethod: payment.paymentMethod || 'cash',
            date: payment.date || payment.createdAt,
            notes: payment.notes || '',
            linkedBillNumber: payment.billId
                ? (bills.find(b => b._id.equals(payment.billId))?.billNumber || '')
                : '',
            receiptRef: payment._id.toString().slice(-5).toUpperCase(),
        }));

        // ── Build chronological ledger (matching statement image) ──
        const ledgerEntries = [];

        // Add bill entries (debits)
        for (const bill of bills) {
            const itemSummary = (bill.items || []).map(item =>
                `${item.productName} (x${item.quantity})`
            ).join(', ');

            ledgerEntries.push({
                date: bill.billDate || bill.createdAt,
                type: 'bill',
                billNumber: bill.billNumber,
                particulars: `Sales Invoice\n${itemSummary}`,
                debit: bill.grandTotal,
                credit: 0,
                _sortDate: bill.billDate || bill.createdAt,
            });
        }

        // Add payment entries (credits)
        for (const payment of payments) {
            const linkedBill = payment.billId
                ? bills.find(b => b._id.equals(payment.billId))
                : null;

            const receiptRef = payment._id.toString().slice(-5).toUpperCase();
            let particulars = '';
            if (linkedBill) {
                particulars = `Initial payment for Bill #${linkedBill.billNumber ? linkedBill.billNumber.slice(-8) : ''}\nReceipt ref #${receiptRef}`;
            } else {
                particulars = `Received Payment\nReceipt ref #${receiptRef}`;
            }

            ledgerEntries.push({
                date: payment.date || payment.createdAt,
                type: 'payment',
                paymentMethod: payment.paymentMethod || 'cash',
                receiptRef: receiptRef,
                particulars,
                debit: 0,
                credit: payment.amount,
                _sortDate: payment.date || payment.createdAt,
            });
        }

        // Sort chronologically
        ledgerEntries.sort((a, b) => new Date(a._sortDate) - new Date(b._sortDate));

        // Calculate running balance
        let runningBalance = 0;
        for (const entry of ledgerEntries) {
            runningBalance += entry.debit - entry.credit;
            entry.balance = runningBalance;
            delete entry._sortDate; // Clean up temp field
        }

        // ── Calculate summary ──
        const totalBilled = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        const startDate = bills[0]?.billDate || bills[0]?.createdAt;
        const endDate = new Date();

        // ── Create PastRecord ──
        const pastRecord = new PastRecord({
            shopId: shop._id,
            customerId: customer._id,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            customerAddress: customer.address || '',
            shopSnapshot: {
                shopName: shop.shopName,
                ownerName: shop.ownerName,
                phone: shop.contact?.phone || '',
                email: shop.contact?.email || '',
                address: typeof shop.address === 'object'
                    ? `${shop.address.street || ''}, ${shop.address.city || ''}, ${shop.address.state || ''}`.trim()
                    : (shop.address || ''),
            },
            statementNumber,
            cycleNumber,
            startDate,
            endDate,
            summary: {
                totalBilled,
                totalPaid,
                billCount: bills.length,
                paymentCount: payments.length,
                transactionCount: bills.length + payments.length,
            },
            bills: billSnapshots,
            payments: paymentSnapshots,
            ledger: ledgerEntries,
            clearedAt: new Date(),
            archivedBy: userId,
        });

        await pastRecord.save({ session });

        // ── Delete all bills for this customer ──
        await Bills.deleteMany({
            customerId: new mongoose.Types.ObjectId(customerId),
            shopId: shop._id
        }).session(session);

        // ── Delete all payment records for this customer ──
        await PaymentRecord.deleteMany({
            customerId: new mongoose.Types.ObjectId(customerId),
            shopId: shop._id
        }).session(session);

        // ── Reset customer balance ──
        customer.currentBalance = 0;
        await customer.save({ session });

        await session.commitTransaction();

        res.json({
            message: `Successfully archived ${bills.length} bills and ${payments.length} payments for ${customer.name}. Cycle #${cycleNumber}.`,
            pastRecord: {
                _id: pastRecord._id,
                statementNumber: pastRecord.statementNumber,
                cycleNumber: pastRecord.cycleNumber,
                summary: pastRecord.summary,
                startDate: pastRecord.startDate,
                endDate: pastRecord.endDate,
            },
            deletedBills: bills.length,
            deletedPayments: payments.length,
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error archiving customer records:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};


// ─── Get Customer Past Records ───
const getCustomerPastRecords = async (req, res) => {
    try {
        const userId = req.finduser._id;
        const role = req.finduser.role;

        if (role !== 'store_owner' && role !== 'admin') {
            return res.status(403).json({
                message: "Forbidden: You do not have access to view past records"
            });
        }

        const { customerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }

        // Verify shop ownership
        const customer = await Customer.findById(customerId).lean();
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const shop = await Shop.findOne({ ownerId: userId });
        if (!shop || !customer.shopId.equals(shop._id)) {
            return res.status(403).json({
                message: "Forbidden: You don't have access to this customer"
            });
        }

        const pastRecords = await PastRecord.find({
            customerId: new mongoose.Types.ObjectId(customerId),
            shopId: shop._id
        }).sort({ cycleNumber: -1 }).lean();

        res.json({
            message: "Past records retrieved successfully",
            count: pastRecords.length,
            pastRecords,
        });

    } catch (error) {
        console.error('Error fetching past records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Helper function to generate statement number
const generateStatementNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'STM-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};


module.exports = { addNewBills, updateBill, deleateBill, getBill, getAllBills, recordPayment, archiveAndClearCustomer, getCustomerPastRecords }
