const mongoose = require('mongoose');
const Bills = require('../models/billsSchema');
const Customer = require('../models/customerSchema');
const Shop = require('../models/shopSchema');
const PaymentRecord = require('../models/paymentRecordSchema');


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

        // Find or create customer
        if (phone || customerName) {
            let customer = null;

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

                const advanceApplied = req.body._advanceApplied || 0;
                // Net effect on balance: billDue minus advance applied
                customer.currentBalance += (billDue - advanceApplied);
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
};




// const updateBill = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const userId = req.session.userId;
//         const role = req.session.role;

//         if (role !== 'store_owner' && role !== "admin") {
//             return res.status(403).json({
//                 message: "Forbidden: You do not have access to add bills"
//             });
//         }
//         const { billId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(billId)) {
//             return res.status(400).json({ message: "Invalid bill ID" });
//         }

//         const bill = await Bills.findById(billId).session(session);
//         if (!bill) {
//             await session.abortTransaction();
//             return res.status(404).json({ message: "Bill not found" });
//         }

//         // Check if user has access to this bill's shop
//         // You might want to add additional authorization checks here

//         // Prevent updating certain fields
//         const allowedUpdates = [
//             'paymentStatus', 'amountPaid', 'paymentMethod', 'notes',
//             'referenceNumber', 'status', 'dueDate'
//         ];

//         const updates = Object.keys(req.body);
//         const isValidOperation = updates.every(update => allowedUpdates.includes(update));

//         if (!isValidOperation) {
//             await session.abortTransaction();
//             return res.status(400).json({
//                 message: "Invalid updates! Only certain fields can be updated"
//             });
//         }

//         // Handle payment updates
//         if (req.body.amountPaid !== undefined) {
//             if (req.body.amountPaid > bill.grandTotal) {
//                 await session.abortTransaction();
//                 return res.status(400).json({
//                     message: "Amount paid cannot exceed grand total"
//                 });
//             }

//             // Update payment status based on amount paid
//             if (req.body.amountPaid >= bill.grandTotal) {
//                 req.body.paymentStatus = 'paid';
//             } else if (req.body.amountPaid > 0) {
//                 req.body.paymentStatus = 'partial';
//             } else {
//                 req.body.paymentStatus = 'pending';
//             }
//         }

//         updates.forEach(update => bill[update] = req.body[update]);
//         bill.updatedBy = userId;

//         await bill.save({ session });
//         await session.commitTransaction();

//         const updatedBill = await Bills.findById(billId)
//             .populate('customerId', 'name phone email')
//             .populate('shopId', 'name address');

//         res.json({
//             message: "Bill updated successfully",
//             bill: updatedBill
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         console.error('Error in updating bill:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     } finally {
//         session.endSession();
//     }
// };

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
                    // Remove old balance effect and apply new one
                    const oldBalanceEffect = bill.grandTotal - oldAmountPaid;
                    const newBalanceEffect = bill.grandTotal - newAmountPaid;

                    customer.currentBalance = customer.currentBalance + oldBalanceEffect - newBalanceEffect;
                    await customer.save({ session });
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
    try {

        const userId = req.finduser._id
        const role = req.finduser.role



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

        // Create payment record
        const paymentRecord = new PaymentRecord({
            shopId: shop._id,
            customerId: customer._id,
            amount,
            paymentMethod: paymentMethod || 'cash',
            notes: notes || '',
            balanceAfter: customer.currentBalance,
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


module.exports = { addNewBills, updateBill, deleateBill, getBill, getAllBills, recordPayment }
