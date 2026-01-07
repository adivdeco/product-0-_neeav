const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        // unique: true
    },
    description: String,

    // Product category specific to building materials
    category: {
        type: String,
        required: true,
        enum: [
            'Cement & Concrete',
            'Bricks & Blocks',
            'Steel & Reinforcement',
            'Sand & Aggregates',
            'Paints & Finishes',
            'Tools & Equipment',
            'Plumbing',
            'Electrical',
            'Tiles & Sanitary',
            'Hardware & Fittings',
            'Other'
        ]
    },

    brand: String,
    model: String,

    // size: String,
    // weight: Number,
    // color: String,
    material: String,


    variants: [{
        sku: { type: String }, // Unique Stock Keeping Unit ID
        variantName: String,   // e.g., "100g Packet" or "Loose (per kg)"

        size: String,   // e.g., 10mm, 12mm (for rods) or 50kg (for cement bags)
        color: String,  // e.g., Red, Blue (for paints)

        weightValue: { type: Number, default: 0 },

        // The Unit logic
        unit: {
            type: String,
            enum: ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'],
            required: true
        },

        price: { type: Number, required: true, min: 0 },
        costPrice: { type: Number, min: 0 }, // For your profit calculation

        stock: { type: Number, default: 0 },
        minStockLevel: { type: Number, default: 5 },

        // --- 3. Bulk Pricing (For Steel/Cement) ---
        // Logic: If user buys quantity >= minQuantity, apply discountPrice
        // tierPricing: [{
        //     minQuantity: Number, // e.g., 100 (kg)
        //     discountPrice: Number // e.g., Lower price per unit
        // }]
    }],

    // price: {
    //     type: Number,
    //     required: true,
    //     min: 0
    // },
    // costPrice: {
    //     type: Number,
    //     min: 0
    // },

    taxRate: {
        type: Number,
        default: 0
    },

    // stock: {
    //     type: Number,
    //     default: 0
    // },
    // minStockLevel: {
    //     type: Number,
    //     default: 5
    // },
    // unit: {
    //     type: String,
    //     required: true,
    //     enum: ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter']
    // },

    supplier: String,
    hsnCode: String,

    isActive: {
        type: Boolean,
        default: true
    },
    ProductImage: {
        type: String,
        default: ''
    },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 },
        reviews: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                required: true,
                maxlength: 500
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },

    shipping: {
        isFree: { type: Boolean, default: false },
        cost: { type: Number, default: 0 },
        estimatedDays: String
    },

    // reviews: [{
    //     userId: { type: Schema.Types.ObjectId, ref: 'User' },
    //     rating: { type: Number, required: true, min: 1, max: 5 },
    //     comment: String,
    //     images: [String],
    //     createdAt: { type: Date, default: Date.now },
    //     helpful: { type: Number, default: 0 }
    // }],

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// 1. Calculate Total Stock across all variants
productSchema.virtual('totalStock').get(function () {
    // Loop through variants and add up the stock
    if (!this.variants || this.variants.length === 0) return 0;
    return this.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
});

// 2. Stock Status (Based on total stock)
productSchema.virtual('stockStatus').get(function () {
    const total = this.totalStock; // Uses the virtual above

    if (total === 0) return 'Out of Stock';

    // Check if ANY variant is critically low (optional logic)
    // Or just check global low stock
    if (total <= 5) return 'Low Stock';

    return 'In Stock';
});

// Index for better query performance
productSchema.index({ shopId: 1, category: 1 });
productSchema.index({ shopId: 1, name: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'rating.average': -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;