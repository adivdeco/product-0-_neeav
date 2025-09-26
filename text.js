// const mongoose = require('mongoose');
// const { Schema } = mongoose;


// const userSchema = new Schema({
//     name: {
//         type: String,
//         required: true,
//         minLength: 3,
//         // maxLenghth: 10,
//         trim: true,
//         lowercase: true,
//     },

//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,
//     },

//     phone: {
//         type: String,
//         default: null,
//     },

//     password: {
//         type: String,
//         required: true,
//         minLength: 4
//     },

//     role: {
//         type: String,
//         enum: ["nUser", "store_owner", "contractor", "co-admin", "admin"],
//         default: "nUser",
//     },

//     address: {
//         street: String,
//         city: String,
//         state: String,
//         pincode: String,
//         country: { type: String, default: "In, Bihar 821115" },

//     },

//     // ✅ For store owners
//     storeDetails: {
//         storeName: String,
//         gstNumber: String,
//         licenseId: String,
//         isVerified: { type: Boolean, default: false },
//         rating: { type: Number, default: 0 },
//         productCategories: [String], // e.g., ["cement", "bricks", "steel"],
//     },

//     // ✅ For contractors
//     contractorDetails: {
//         specialization: [String], // e.g., ["plumbing", "electrical", "masonry"]
//         yearsOfExperience: Number,
//         rating: { type: Number, default: 0 },
//         isVerified: { type: Boolean, default: false },

//     },

//     avatar: {
//         type: String,
//         default: '',
//     },

//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },

//     updatedAt: {
//         type: Date,
//         default: Date.now,
//     }
// }, { timestamps: true });



// const User = mongoose.model("user", userSchema);
// module.exports = User;


// khata- addbills
// const addNewBills = async (req, res) => {
//     try {
//         const userId = req.session.userId;
//         const role = req.session.role;
//         const email = req.session.email;

//         // Check authentication and authorization
//         if (!email || (role !== 'store_owner' && role !== 'admin')) {
//             return res.status(403).json({ message: "Forbidden: You do not have access to add bills" });
//         }

//         // Validate required fields
//         const { customerName, items, totalAmount, grandTotal, shopId } = req.body;

//         if (!customerName || !items || !totalAmount || !grandTotal || !shopId) {
//             return res.status(400).json({
//                 message: "Missing required fields: customerName, items, totalAmount, grandTotal, and shopId are required"
//             });
//         }

//         // Validate items array
//         if (!Array.isArray(items) || items.length === 0) {
//             return res.status(400).json({
//                 message: "Items must be a non-empty array"
//             });
//         }

//         // Validate each item
//         for (const item of items) {
//             if (!item.productName || !item.quantity || !item.price) {
//                 return res.status(400).json({
//                     message: "Each item must have productName, quantity, and price"
//                 });
//             }
//         }

//         // Generate a unique bill number (you might want to use a more robust method)
//         const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//         const newBill = await Bills.create({
//             ...req.body,
//             billNumber,
//             createdBy: userId // Track who created the bill
//         });

//         res.status(201).json({
//             message: "New bill added successfully",
//             bill: newBill
//         });

//     } catch (error) {
//         console.error('Error in adding new bill:', error);

//         // Handle duplicate bill number error
//         if (error.code === 11000 && error.keyPattern && error.keyPattern.billNumber) {
//             return res.status(400).json({
//                 message: "Bill number already exists. Please try again."
//             });
//         }

//         // Handle validation errors
//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(val => val.message);
//             return res.status(400).json({
//                 message: "Validation error",
//                 errors
//             });
//         }

//         res.status(500).json({ message: 'Internal server error' });
//     }
// };




const mongoose = require('mongoose');
const Shop = require("../models/shopSchema");
const User = require('../models/userSchema');
const { generateTempPassword, hashPassword, sendCredentialsEmail } = require('../utils/authHelpers');
const crypto = require('crypto');

const addShopOwner = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.session.userId;
        const role = req.session.role;
        const email = req.session.email;

        if (!email || (role !== 'co-admin' && role !== "admin")) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).send("Forbidden: You do not have access to addShop");
        }

        const { shopName, contact, address, ownerName } = req.body;
        const phone = contact?.phone;
        const ownerEmail = contact?.email; // prefer owner email inside contact
        const city = address?.city;
        const state = address?.state;
        const pincode = address?.pincode;

        // Validate required fields
        if (!shopName || !ownerName || !contact || !phone || !address || !city || !state || !pincode || !ownerEmail) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Missing required fields: shopName, ownerName, contact.phone, contact.email, address.city, address.state, address.pincode are required"
            });
        }

        // Check duplicate shop for same phone/name
        const existingShop = await Shop.findOne({
            shopName,
            ownerName,
            'contact.phone': phone
        }).session(session);

        if (existingShop) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: "You already have a shop with this name/phone" });
        }

        // Does a User exist for this owner (by email or phone)?
        let ownerUser = null;
        ownerUser = await User.findOne({ $or: [{ email: ownerEmail }, { phone }] }).session(session);

        let tempPasswordPlain = null;

        if (!ownerUser) {
            // create a new user with temporary password
            tempPasswordPlain = generateTempPassword(12);
            const hashed = await hashPassword(tempPasswordPlain);

            const newUserPayload = {
                name: ownerName,
                email: ownerEmail,
                phone,
                password: hashed,
                role: 'store_owner',
            };

            ownerUser = await User.create([newUserPayload], { session })
                .then(docs => docs[0]);

        } else {
            // user exists: if their role isn't store_owner, optionally promote them
            if (ownerUser.role !== 'store_owner') {
                ownerUser.role = 'store_owner';
                // do not change password here
                await ownerUser.save({ session });
            }
        }

        // Create shop with ownerId reference
        const newShopPayload = {
            ...req.body,
            userId: userId,       // who created the shop (admin)
            ownerId: ownerUser._id
        };

        const newShop = await Shop.create([newShopPayload], { session })
            .then(docs => docs[0]);

        // Commit DB transaction
        await session.commitTransaction();
        session.endSession();

        // Send credentials email (do this after commit)
        // Create a short-lived password reset token (recommended) instead of sending plain password.
        // For simplicity, if we generated temp password above, email it with a reset link:
        let resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?email=${encodeURIComponent(ownerUser.email)}&token=${crypto.randomBytes(24).toString('hex')}`;
        // NOTE: store the token & expiry in DB (or a ResetToken collection) so it can be validated later. See notes below.

        try {
            await sendCredentialsEmail({
                toEmail: ownerUser.email,
                ownerName: ownerUser.name,
                tempPassword: tempPasswordPlain || '(existing password retained — please reset if you want)',
                resetLink
            });
        } catch (mailErr) {
            console.error('Failed to send credentials email:', mailErr);
            // Not fatal: inform admin but shop is created
        }

        res.status(201).json({
            message: "New Shop added successfully",
            newShop,
            ownerUser: {
                _id: ownerUser._id,
                email: ownerUser.email,
                name: ownerUser.name
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error in adding New Shop:', error);

        if (error.code === 11000) {
            return res.status(409).json({ message: 'Shop or user with similar details already exists' });
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { addShopOwner };



// important 
// When customer makes a payment against credit
if (req.body.isPayment && req.body.againstCredit) {
    customer.currentBalance -= paymentAmount;
    await customer.save({ session });

    // Create payment record
    const payment = new Payment({
        customerId,
        amount: paymentAmount,
        type: 'credit_payment'
    });
    await payment.save({ session });
}

// When viewing customer account
const customerAccount = await Customer.findById(customerId).select('name currentBalance creditLimit');


const arr = [10, 20, 30]

const total = arr.reduce((acc, val) => acc + val, 0);
console.log(total); // 60