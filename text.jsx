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
        unique: true
    },
    description: String,

    // Enhanced description fields
    shortDescription: String,
    features: [String],
    specifications: Map,

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
    size: String,
    weight: Number,
    color: String,

    // Enhanced pricing
    price: {
        type: Number,
        required: true,
        min: 0
    },
    costPrice: {
        type: Number,
        min: 0
    },
    comparePrice: {
        type: Number,
        min: 0
    },
    taxRate: {
        type: Number,
        default: 18
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Enhanced inventory
    stock: {
        type: Number,
        default: 0
    },
    minStockLevel: {
        type: Number,
        default: 5
    },
    sku: String,
    barcode: String,

    unit: {
        type: String,
        required: true,
        enum: ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter']
    },

    supplier: String,
    hsnCode: String,

    // E-commerce features
    images: [{
        url: String,
        alt: String,
        isPrimary: { type: Boolean, default: false }
    }],

    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },

    reviews: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        images: [String],
        createdAt: { type: Date, default: Date.now },
        helpful: { type: Number, default: 0 }
    }],

    // SEO and visibility
    metaTitle: String,
    metaDescription: String,
    slug: String,

    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isActive: {
        type: Boolean,
        default: true
    },

    // Shipping information
    weight: {
        value: Number,
        unit: { type: String, default: 'kg' }
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, default: 'cm' }
    },

    shipping: {
        isFree: { type: Boolean, default: false },
        cost: { type: Number, default: 0 },
        estimatedDays: String
    },

    warranty: {
        period: String, // "1 year", "2 years", etc.
        type: String, // "Manufacturer", "Seller"
        details: String
    },

    returnPolicy: {
        isReturnable: { type: Boolean, default: true },
        period: { type: Number, default: 7 }, // days
        conditions: String
    },

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

    // Calculate discount percentage if comparePrice exists
    if (this.comparePrice && this.comparePrice > this.price) {
        this.discount = Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    }

    next();
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
    if (this.stock === 0) return 'Out of Stock';
    if (this.stock <= this.minStockLevel) return 'Low Stock';
    return 'In Stock';
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function () {
    if (this.discount > 0) {
        return this.price - (this.price * this.discount / 100);
    }
    return this.price;
});

// Index for better query performance
productSchema.index({ shopId: 1, category: 1 });
productSchema.index({ shopId: 1, name: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'rating.average': -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;