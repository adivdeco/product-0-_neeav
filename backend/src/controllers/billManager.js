const Bills = require('../models/billsSchema')
const User = require('../models/userSchema')





const addNewBills = async (req, res) => {
    try {
        const userId = req.session.userId
        const role = req.session.role
        const email = req.session.email

        if (!email || role != 'store_owner' && role != "admin") {
            return res.status(403).send("Forbidden: You do not have asses to addbills ")
        }

        const { customerName, items, totalAmount, grandTotal, shopId } = req.body;

        if (!customerName || !items || !totalAmount || !grandTotal || !shopId) {
            return res.status(400).json({
                message: "Missing required fields: customerName, items, totalAmount, grandTotal, and shopId are required"
            });
        }
        // Generate a unique bill number (you might want to use a more robust method)
        const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newBill = await Bills.create({
            ...req.body,
            billNumber,
            createdBy: userId // Track who created the bill
        });

        res.status(201).send({
            message: "New_bill added  successfully",
            newBill
        });



    } catch (error) {
        console.error('Error in adding New bill:', error);

        // Handle duplicate bill number error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.billNumber) {
            return res.status(400).json({
                message: "Bill number already exists. Please try again."
            });
        }

        res.sendStatus(500).json({ message: 'Internal server error' });
    }
}

const updateBill = async (req, res) => {
    try {
        // const userId = req.finduser._id
    } catch (error) {
        console.error('Error in adding New bill:', error);
        res.sendStatus(500).json({ message: 'Internal server error' });
    }
}
const deleateBill = async (req, res) => {
    try {
        // const userId = req.finduser._id
    } catch (error) {
        console.error('Error in adding New bill:', error);
        res.sendStatus(500).json({ message: 'Internal server error' });
    }
}

const getBill = async (req, res) => {
    try {
        // const userId = req.finduser._id
    } catch (error) {
        console.error('Error in adding New bill:', error);
        res.sendStatus(500).json({ message: 'Internal server error' });
    }
}

const getAllBills = async (req, res) => {
    try {
        // const userId = req.finduser._id
    } catch (error) {
        console.error('Error in adding New bill:', error);
        res.sendStatus(500).json({ message: 'Internal server error' });
    }
}

module.exports = { addNewBills, updateBill, deleateBill, getBill, getAllBills }