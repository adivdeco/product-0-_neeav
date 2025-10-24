import { z } from 'zod';

export const UserUpdateSchema = z.object({
    // Basic Information
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().or(z.literal('')),

    // Address
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        country: z.string().optional(),
    }).optional(),

    // Role (only admin can change this)
    role: z.enum(["User", "store_owner", "contractor", "co-admin", "admin"]),

    // Store Details (for store_owner role)
    storeDetails: z.object({
        storeName: z.string().optional(),
        gstNumber: z.string().optional(),
        licenseId: z.string().optional(),
        isVerified: z.boolean().optional(),
        rating: z.number().min(0).max(5).optional(),
        productCategories: z.array(z.enum([
            'Cement & Concrete',
            'Bricks & Blocks',
            'Steel & Reinforcement',
            'Sand & Aggregates',
            'Paints & Finishes',
            'Tools & Equipment',
            'Plumbing',
            'Electrical',
            'Tiles & Sanitary',
            'Hardware & Fittings'
        ])).optional(),
    }).optional(),

    // Contractor Details (for contractor role)
    contractorDetails: z.object({
        specialization: z.array(z.enum([
            'Masonry',
            'Plumbing',
            'Electrical',
            'Carpentry',
            'Painting',
            'Flooring',
            'Roofing',
            'Structural',
            'Labor Supply',
            'Construction',
            'Renovation',
            'Demolition',
            'Landscaping',
            'HVAC',
            'Welding'
        ])).optional(),
        yearsOfExperience: z.number().min(0).optional(),
        hourlyRate: z.number().min(0).optional(),
        licenseNumber: z.string().optional(),
        isVerified: z.boolean().optional(),
        totalProjects: z.number().min(0).optional(),
        completedProjects: z.number().min(0).optional(),
        skills: z.array(z.string()).optional(),
        bio: z.string().optional(),
    }).optional(),

    avatar: z.string().optional(),
}).refine((data) => {
    // Custom validation: If role is store_owner, storeDetails should have storeName
    if (data.role === 'store_owner' && data.storeDetails) {
        return !data.storeDetails.storeName || data.storeDetails.storeName.length > 0;
    }
    return true;
}, {
    message: "Store name is required for store owners",
    path: ["storeDetails.storeName"]
});

// export type UserUpdateData = z.infer<typeof UserUpdateSchema>;