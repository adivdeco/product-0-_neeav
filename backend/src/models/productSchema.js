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

    price: {
        type: Number,
        required: true,
        min: 0
    },
    costPrice: {
        type: Number,
        min: 0
    },
    taxRate: {
        type: Number,
        default: 18
    },

    stock: {
        type: Number,
        default: 0
    },
    minStockLevel: {
        type: Number,
        default: 5
    },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter']
    },

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

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
    if (this.stock === 0) return 'Out of Stock';
    if (this.stock <= this.minStockLevel) return 'Low Stock';
    return 'In Stock';
});

// Index for better query performance
productSchema.index({ shopId: 1, category: 1 });
productSchema.index({ shopId: 1, name: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;