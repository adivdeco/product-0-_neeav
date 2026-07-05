const mongoose = require('mongoose');
const Bills = require('../models/billsSchema');
const PaymentRecord = require('../models/paymentRecordSchema');

const migratePayments = async () => {
    try {
        console.log('🔄 Running payment records migration check...');
        // Find all bills that have amountPaid > 0
        const billsWithPayments = await Bills.find({ amountPaid: { $gt: 0 } }).lean();
        
        let migratedCount = 0;
        for (const bill of billsWithPayments) {
            // Check if there is already a PaymentRecord for this bill
            const existingPayment = await PaymentRecord.findOne({ billId: bill._id });
            if (!existingPayment) {
                // Create a PaymentRecord for the bill's amountPaid
                const paymentRecord = new PaymentRecord({
                    shopId: bill.shopId,
                    customerId: bill.customerId,
                    billId: bill._id,
                    amount: bill.amountPaid,
                    paymentMethod: bill.paymentMethod || 'cash',
                    notes: `Initial payment for Bill #${bill.billNumber ? bill.billNumber.slice(-8) : 'N/A'}`,
                    balanceAfter: 0, // Will be computed dynamically on the frontend/ledger
                    date: bill.billDate || bill.createdAt || new Date(),
                    createdBy: bill.createdBy
                });
                await paymentRecord.save();
                migratedCount++;
            }
        }
        if (migratedCount > 0) {
            console.log(`✅ Payment records migration complete: Created ${migratedCount} PaymentRecord documents.`);
        } else {
            console.log('✅ Payment records migration check complete: All payments up-to-date.');
        }
    } catch (error) {
        console.error('❌ Error during payment migration:', error);
    }
};

module.exports = migratePayments;
