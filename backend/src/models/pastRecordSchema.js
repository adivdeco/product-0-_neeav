const mongoose = require('mongoose');
const { Schema } = mongoose;

const pastRecordSchema = new Schema({
    // Shop reference
    shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },

    // Customer reference (kept even after archival for linking)
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },

    // Customer snapshot (for PDF generation without needing to look up customer)
    customerName: {
        type: String,
        required: true
    },
    customerPhone: String,
    customerEmail: String,
    customerAddress: String,

    // Shop snapshot (for PDF header)
    shopSnapshot: {
        shopName: String,
        ownerName: String,
        phone: String,
        email: String,
        address: String,
    },

    // Statement metadata
    statementNumber: {
        type: String,
        required: true,
        unique: true
    },

    // Cycle tracking — a customer can clear dues multiple times
    cycleNumber: {
        type: Number,
        default: 1
    },

    // Statement period
    startDate: Date,   // earliest bill date in this cycle
    endDate: Date,     // date of clearance / archive

    // ── Summary (for quick display without iterating arrays) ──
    summary: {
        totalBilled: { type: Number, default: 0 },    // sum of all bill grandTotals
        totalPaid: { type: Number, default: 0 },       // sum of all payment amounts
        billCount: { type: Number, default: 0 },
        paymentCount: { type: Number, default: 0 },
        transactionCount: { type: Number, default: 0 }, // bills + payments
    },

    // ── Compact bill snapshots (debit entries for ledger) ──
    bills: [{
        billNumber: String,
        billDate: Date,
        items: [{
            productName: String,
            quantity: Number,
            unit: { type: String, default: 'pcs' },
            price: Number,
            discount: { type: Number, default: 0 },
        }],
        totalAmount: Number,
        grandTotal: Number,
        discount: { type: Number, default: 0 },
        notes: String,
    }],

    // ── Compact payment snapshots (credit entries for ledger) ──
    payments: [{
        amount: Number,
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'upi', 'bank_transfer'],
            default: 'cash'
        },
        date: Date,
        notes: String,
        // If this was an initial payment for a specific bill
        linkedBillNumber: String,
        // Receipt reference for display
        receiptRef: String,
    }],

    // ── Combined ledger (chronological, for the statement table) ──
    // Pre-computed ledger entries in chronological order for easy rendering
    ledger: [{
        date: Date,
        type: {
            type: String,
            enum: ['bill', 'payment'],
            required: true
        },
        // For bills
        billNumber: String,
        particulars: String, // e.g., "Sales Invoice\nacc (x10)"
        // For payments
        paymentMethod: String,
        receiptRef: String,
        // Amounts
        debit: { type: Number, default: 0 },   // bill amounts
        credit: { type: Number, default: 0 },   // payment amounts
        balance: { type: Number, default: 0 },   // running balance
    }],

    // Metadata
    clearedAt: {
        type: Date,
        default: Date.now
    },
    archivedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
pastRecordSchema.index({ shopId: 1, customerId: 1 });
pastRecordSchema.index({ customerId: 1, cycleNumber: -1 });
pastRecordSchema.index({ statementNumber: 1 });

const PastRecord = mongoose.model('PastRecord', pastRecordSchema);
module.exports = PastRecord;
