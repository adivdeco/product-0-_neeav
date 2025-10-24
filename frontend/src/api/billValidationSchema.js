
import { z } from 'zod';

// Zod Schema for a single bill item
export const ItemSchema = z.object({
    // productId is optional on the UI/front-end but required for the backend logic flow later
    // productId: z.string().optional().or(z.literal('')),
    productName: z.string().min(1, 'Product Name is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unit: z.enum(['kg', 'g', 'l', 'ml', 'pcs', 'pack']).default('pcs'),
    price: z.number().min(0, 'Price must be greater than 0'),
    discount: z.number().min(0).max(100).default(0), // Added max 100
    taxRate: z.number().min(0).default(0),
});

// Zod Schema for the entire bill form
export const AddBillSchema = z.object({
    // Customer Details
    customerName: z.string().min(2, 'Customer Name is required'),
    // Phone is required for customer lookup/creation in your backend, but we'll allow empty string on the UI
    phone: z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Invalid phone number format').optional().or(z.literal('')),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),

    // Bill Items Array
    items: z.array(ItemSchema).min(1, 'At least one item is required'),

    // Financial & Other Inputs (Calculated fields like totalAmount/grandTotal are excluded here 
    // as they are derived and injected before API submission, not user input)
    discount: z.number().min(0).default(0), // Bill-level discount (Fixed value)
    deliveryCharge: z.number().min(0).default(0),
    packagingCharge: z.number().min(0).default(0),
    amountPaid: z.number().min(0, 'Amount paid cannot be negative'),

    // Payment & Credit
    paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer', 'credit']).default('cash'),
    isCredit: z.boolean().default(false),
    creditPeriod: z.number().int().min(1, 'Credit period is required for credit bills').optional().nullable(),
    creditInterestRate: z.number().min(0).optional().nullable(),
    dueDate: z.string().optional(), // Using string for date input unless a specific date picker is used

    // Notes & Reference
    notes: z.string().optional(),
    referenceNumber: z.string().optional(),

    // Placeholder for taxAmount (gets calculated but we keep it in the form data for validation clarity if needed)
    taxAmount: z.number().min(0).default(0),

}).refine((data) => {
    // Custom refinement: If it's a credit bill, creditPeriod must be a positive number.
    if (data.isCredit) {
        return data.creditPeriod !== undefined && data.creditPeriod !== null && data.creditPeriod > 0;
    }
    return true;
}, {
    message: 'Credit Period is required and must be greater than 0 for credit bills.',
    path: ['creditPeriod'],
});

// Optional: Define a type for strong typing in React (if using TypeScript)
// export type BillFormData = z.infer<typeof AddBillSchema>;