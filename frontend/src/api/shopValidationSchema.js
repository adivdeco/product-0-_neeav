// shopValidationSchema.js
import { z } from 'zod';

// Utility for Indian Phone Number validation (starting with 6-9, 10 digits)
const indianPhoneRegex = /^[6-9]\d{9}$/;

// List of allowed categories from your Mongoose schema
const CATEGORIES_ENUM = [
    'Cement & Concrete', 'Bricks & Blocks', 'Steel & Reinforcement', 'Sand & Aggregates',
    'Paints & Finishes', 'Tools & Equipment', 'Plumbing', 'Electrical',
    'Tiles & Sanitary', 'Hardware & Fittings'
];

// List of working days
const WORKING_DAYS_ENUM = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const shopSchema = z.object({
    // Basic shop information
    shopName: z.string().min(1, "Shop Name is required").max(100, "Shop Name must be 100 characters or less"),
    ownerName: z.string().min(1, "Owner Name is required"),
    description: z.string().max(500, "Description must be 500 characters or less").optional(),

    // Contact (must include a password for owner creation)
    contact: z.object({
        email: z.string().email("Invalid email format").min(1, "Email is required"),
        phone: z.string().regex(indianPhoneRegex, "Invalid Indian phone number (10 digits)").min(1, "Phone is required"),
        alternatePhone: z.string().regex(indianPhoneRegex, "Invalid alternate phone number").optional().or(z.literal('')),
        password: z.string().min(6, "Password must be at least 6 characters"), // Required for backend logic
    }),

    // Address information
    address: z.object({
        street: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().min(6, "Pincode is required"),
        landmark: z.string().optional(),
    }),

    // Shop specialization
    categories: z.array(z.enum(CATEGORIES_ENUM)).optional(),

    // Business hours
    businessHours: z.object({
        open: z.string().default('09:00'),
        close: z.string().default('18:00'),
        workingDays: z.array(z.enum(WORKING_DAYS_ENUM)).optional().default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
    }).optional(),

    // Note: ownerId, createdBy, etc. are handled by the backend
});

// Export the arrays for the component
export { CATEGORIES_ENUM, WORKING_DAYS_ENUM };