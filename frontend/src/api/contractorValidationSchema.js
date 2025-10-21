import { z } from 'zod';

const indianPhoneRegex = /^[6-9]\d{9}$/;

const SERVICES_ENUM = [
    'Masonry', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Flooring',
    'Roofing', 'Structural', 'Labor Supply', 'Construction', 'Renovation',
    'Demolition', 'Landscaping', 'HVAC', 'Welding'
];

export const contractorSchema = z.object({
    contractorName: z.string().min(3, "Contractor Name is required").max(50, "Name must be 50 characters or less"),
    description: z.string().max(500, "Description must be 500 characters or less").optional().or(z.literal('')),

    contact: z.object({
        email: z.string().email("Invalid email format").min(1, "Email is required"),
        phone: z.string().regex(indianPhoneRegex, "Invalid Indian phone number (10 digits)").min(1, "Phone is required"),
        alternatePhone: z.string().regex(indianPhoneRegex, "Invalid alternate phone number").optional().or(z.literal('')),
    }),

    password: z.string().min(6, "Password must be at least 6 characters"),

    address: z.object({
        street: z.string().optional().or(z.literal('')),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().min(6, "Pincode is required"),
        landmark: z.string().optional().or(z.literal('')),
    }),

    services: z.array(z.enum(SERVICES_ENUM)).min(1, "At least one service must be selected"),

    experience: z.object({
        years: z.number().int().min(0, "Years of experience cannot be negative").max(80, "Too many years").optional(),
        description: z.string().optional().or(z.literal('')),
    }).optional(),

    pricing: z.object({
        hourlyRate: z.number().int().min(0, "Rate cannot be negative").optional(),
        dailyRate: z.number().int().min(0, "Rate cannot be negative").optional(),
        projectRate: z.string().max(100, "Max 100 characters").optional().or(z.literal(''))
    }).optional(),

});

export { SERVICES_ENUM };