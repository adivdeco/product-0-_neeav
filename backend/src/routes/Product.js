const express = require('express')
const Product = require('../models/productSchema')
const authMiddleware = require('../middleware/authMiddleware')
const Shop = require('../models/shopSchema')
const ProductRouter = express.Router()
const NodeCache = require('node-cache');
const filterCache = new NodeCache({ stdTTL: 300 }); // 5 minutes default





// ProductRouter.post('/add_items', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.finduser._id;
//         const role = req.finduser.role

//         if (role !== 'store_owner') {
//             return res.status(401).json({ message: 'user must to be store_owner' });
//         }


//         const store = await Shop.findOne({ ownerId: userId });
//         if (!store) {
//             return res.status(400).json({
//                 message: "Shop not found for this user"
//             });
//         }

//         const {
//             name,
//             description,
//             category,
//             brand,
//             model,
//             size,
//             weight,
//             color,
//             price,
//             costPrice,
//             taxRate,
//             stock,
//             minStockLevel,
//             unit,
//             supplier,
//             hsnCode,
//             isActive,
//             ProductImage
//         } = req.body;


//         if (!name || !category || !price || !unit) {
//             return res.status(400).json({
//                 message: "Missing required fields: name, category, price, and unit are required"
//             });
//         }

//         const validCategories = [
//             'Cement & Concrete',
//             'Bricks & Blocks',
//             'Steel & Reinforcement',
//             'Sand & Aggregates',
//             'Paints & Finishes',
//             'Tools & Equipment',
//             'Plumbing',
//             'Electrical',
//             'Tiles & Sanitary',
//             'Hardware & Fittings',
//             'Other'
//         ];

//         if (!validCategories.includes(category)) {
//             return res.status(400).json({
//                 message: "Invalid category",
//                 validCategories: validCategories
//             });
//         }

//         const validUnits = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'];
//         if (!validUnits.includes(unit)) {
//             return res.status(400).json({
//                 message: "Invalid unit",
//                 validUnits: validUnits
//             });
//         }

//         const newProduct = new Product({
//             shopId: store._id,
//             name: name.trim(),
//             description: description || '',
//             category,
//             brand: brand || '',
//             model: model || '',
//             size: size || '',
//             weight: weight || null,
//             color: color || '',
//             price,
//             costPrice: costPrice || null,
//             taxRate: taxRate || 18,
//             stock: stock || 0,
//             minStockLevel: minStockLevel || 5,
//             unit,
//             supplier: supplier || '',
//             hsnCode: hsnCode || '',
//             isActive: isActive !== undefined ? isActive : true,
//             ProductImage: ProductImage || ''
//         });


//         const savedProduct = await newProduct.save();

//         const populatedProduct = await Product.findById(savedProduct._id)
//             .populate('shopId', 'name address contact')

//         res.status(201).json({
//             message: "Product created successfully",
//             product: populatedProduct,
//             stockStatus: savedProduct.stockStatus
//         });

//     } catch (error) {
//         console.error("Error in creating product:", error);

//         if (error.code === 11000) {
//             return res.status(400).json({
//                 message: "Product with similar details already exists"
//             });
//         }

//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             return res.status(400).json({
//                 message: "Validation error",
//                 errors: errors
//             });
//         }

//         res.status(500).json({
//             message: "Error in creating product",
//             error: error.message
//         });
//     }
// });

ProductRouter.post('/add_items', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const role = req.finduser.role

        if (role !== 'store_owner') {
            return res.status(401).json({ message: 'User must be a store_owner' });
        }

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) {
            return res.status(400).json({ message: "Shop not found for this user" });
        }

        const {
            name,
            description,
            category,
            brand,
            model,
            material, // New Field
            variants, // New Array Structure
            shipping, // New Object
            taxRate,
            supplier,
            hsnCode,
            isActive,
            ProductImage
        } = req.body;

        // 1. Basic Validation
        if (!name || !category) {
            return res.status(400).json({
                message: "Missing required fields: Name and Category are required"
            });
        }

        // 2. Variant Validation
        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
                message: "At least one product variant (Price/Unit) is required"
            });
        }

        // Check inside the variants array
        for (const variant of variants) {
            if (!variant.price || !variant.unit) {
                return res.status(400).json({
                    message: "Every variant must have a Price and a Unit"
                });
            }

            const validUnits = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'];
            if (!validUnits.includes(variant.unit)) {
                return res.status(400).json({
                    message: `Invalid unit: ${variant.unit}`,
                    validUnits: validUnits
                });
            }
        }

        // 3. Category Validation
        const validCategories = [
            'Cement & Concrete', 'Bricks & Blocks', 'Steel & Reinforcement',
            'Sand & Aggregates', 'Paints & Finishes', 'Tools & Equipment',
            'Plumbing', 'Electrical', 'Tiles & Sanitary', 'Hardware & Fittings', 'Other'
        ];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid category",
                validCategories: validCategories
            });
        }

        // 4. Create Product
        const newProduct = new Product({
            shopId: store._id,
            name: name.trim(),
            description: description || '',
            category,
            brand: brand || '',
            model: model || '',
            material: material || '', // New

            variants: variants.map(v => ({
                sku: v.sku || '',
                variantName: v.variantName || '',
                size: v.size || '',
                color: v.color || '',
                weightValue: v.weightValue || 0,
                unit: v.unit,
                price: v.price,
                costPrice: v.costPrice || 0,
                stock: v.stock || 0,
                minStockLevel: v.minStockLevel || 5
            })),

            shipping: {
                isFree: shipping?.isFree || false,
                cost: shipping?.cost || 0,
                estimatedDays: shipping?.estimatedDays || ''
            },

            taxRate: taxRate || 0,
            supplier: supplier || '',
            hsnCode: hsnCode || '',
            isActive: isActive !== undefined ? isActive : true,
            ProductImage: ProductImage || ''
        });

        const savedProduct = await newProduct.save();

        const populatedProduct = await Product.findById(savedProduct._id)
            .populate('shopId', 'name address contact');

        res.status(201).json({
            message: "Product created successfully",
            product: populatedProduct,
            stockStatus: savedProduct.stockStatus
        });

    } catch (error) {
        console.error("Error in creating product:", error);

        if (error.code === 11000) {
            return res.status(400).json({ message: "Product with similar details already exists" });
        }
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation error", errors: errors });
        }
        res.status(500).json({ message: "Error in creating product", error: error.message });
    }
});



// Get all products (Store Owner)
ProductRouter.get('/allProduct', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const role = req.finduser.role;

        if (role !== 'store_owner') {
            return res.status(401).json({ message: 'User must be a store_owner' });
        }

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) {
            return res.status(400).json({ message: "Shop not found for this user" });
        }

        const {
            page = 1,
            limit = 20,
            category,
            search,
            minPrice,
            maxPrice,
            stockStatus,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = { shopId: store._id };

        // 1. Category Filter
        if (category) {
            filter.category = category;
        }

        // 2. Search Filter (Updated for Variants)
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { 'variants.sku': { $regex: search, $options: 'i' } }, // Search by SKU
                { 'variants.variantName': { $regex: search, $options: 'i' } } // Search by Variant Name
            ];
        }

        // 3. Price Filter (Look inside variants array)
        if (minPrice || maxPrice) {
            filter['variants.price'] = {};
            if (minPrice) filter['variants.price'].$gte = Number(minPrice);
            if (maxPrice) filter['variants.price'].$lte = Number(maxPrice);
        }

        // 4. Stock Status Filter (Complex due to arrays)
        // We use $elemMatch to find products where AT LEAST ONE variant matches the condition
        if (stockStatus) {
            if (stockStatus === 'out_of_stock') {
                // All variants have 0 stock (Total stock is 0)
                // It is easier to filter this in memory or use aggregation, 
                // but for simple query, we check if NO variant has stock > 0
                filter['variants.stock'] = { $not: { $gt: 0 } };
            } else if (stockStatus === 'low_stock') {
                // At least one variant is low
                filter.variants = {
                    $elemMatch: {
                        stock: { $gt: 0 },
                        $expr: { $lte: ['$stock', '$minStockLevel'] }
                    }
                };
            } else if (stockStatus === 'in_stock') {
                // At least one variant is healthy
                filter.variants = {
                    $elemMatch: {
                        $expr: { $gt: ['$stock', '$minStockLevel'] }
                    }
                };
            }
        }

        const skip = (page - 1) * limit;

        const sort = {};
        // Note: Sorting by 'price' on an array sorts by the min/max value found in that array
        if (sortBy === 'price') {
            sort['variants.price'] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const products = await Product.find(filter)
            .populate('shopId', 'name address')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));
        // Removed .lean() so we can use the virtual 'totalStock' and 'stockStatus'

        // Map response to include calculated fields
        const productsWithStatus = products.map(product => {
            return {
                ...product.toObject(),
                totalStock: product.totalStock, // Uses Schema Virtual
                stockStatus: product.stockStatus // Uses Schema Virtual
            };
        });

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            message: "Products retrieved successfully",
            products: productsWithStatus,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                limit: Number(limit)
            }
        });

    } catch (error) {
        console.error("Error in fetching products:", error);
        res.status(500).json({ message: "Error in fetching products", error: error.message });
    }
});

ProductRouter.delete('/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) return res.status(400).json({ message: "Shop not found" });

        const product = await Product.findOne({ _id: productId, shopId: store._id });
        if (!product) return res.status(404).json({ message: "Product not found" });

        await Product.findByIdAndDelete(productId);

        res.status(200).json({
            message: "Product deleted successfully",
            deletedProduct: { id: product._id, name: product.name }
        });

    } catch (error) {
        console.error("Error in deleting product:", error);
        res.status(500).json({ message: "Error in deleting product", error: error.message });
    }
});

// Update product status (isActive) - No major changes needed
ProductRouter.patch('/:productId/status', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;
        const { isActive } = req.body;

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) return res.status(400).json({ message: "Shop not found" });

        const product = await Product.findOne({ _id: productId, shopId: store._id });
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.isActive = isActive;
        product.updatedAt = Date.now();
        await product.save();

        res.status(200).json({
            message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
            product: { id: product._id, isActive: product.isActive }
        });

    } catch (error) {
        res.status(500).json({ message: "Error updating status", error: error.message });
    }
});

// Update product stock - REWRITTEN FOR VARIANTS
ProductRouter.patch('/:productId/stock', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;
        // Expect variantId (the _id of the subdocument) or sku to identify which variant to update
        const { stock, minStockLevel, variantId, sku } = req.body;

        if (stock === undefined) {
            return res.status(400).json({ message: "Stock value is required" });
        }

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) return res.status(400).json({ message: "Shop not found" });

        // Logic to update specific variant
        let query = { _id: productId, shopId: store._id };
        let update = { $set: { updatedAt: Date.now() } };
        let arrayFilter = {};

        if (variantId) {
            query['variants._id'] = variantId;
            update.$set['variants.$.stock'] = stock;
            if (minStockLevel !== undefined) update.$set['variants.$.minStockLevel'] = minStockLevel;
        } else if (sku) {
            query['variants.sku'] = sku;
            update.$set['variants.$.stock'] = stock;
            if (minStockLevel !== undefined) update.$set['variants.$.minStockLevel'] = minStockLevel;
        } else {
            // Fallback: If no variant specified, and product has only 1 variant, update the first one
            // OR return error. Let's return error for safety.
            return res.status(400).json({ message: "Please provide variantId or sku to update stock" });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            query,
            update,
            { new: true }
        ).populate('shopId', 'name');

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product or Variant not found" });
        }

        res.status(200).json({
            message: "Stock updated successfully",
            product: updatedProduct,
            totalStock: updatedProduct.totalStock // Return virtual
        });

    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({ message: "Error updating stock", error: error.message });
    }
});

// Update product details (Full Update)
ProductRouter.put('/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;
        const updateData = req.body;

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) return res.status(400).json({ message: "Shop not found" });

        // Security: Delete fields that shouldn't be updated via this route
        delete updateData.shopId;
        delete updateData._id;
        delete updateData.createdAt;
        updateData.updatedAt = Date.now();

        // If updating variants, ensure the structure is correct (handled by Schema validation)

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId, shopId: store._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
});

// Get single product by ID
ProductRouter.get('/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;

        const store = await Shop.findOne({ ownerId: userId });
        const product = await Product.findOne({ _id: productId, shopId: store._id })
            .populate('shopId', 'name address');

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.status(200).json({
            message: "Product retrieved successfully",
            product: {
                ...product.toObject(),
                totalStock: product.totalStock,
                stockStatus: product.stockStatus
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
});




// ==========================================
// PUBLIC / CUSTOMER ROUTES
// ==========================================

// Get all active products for customers
ProductRouter.get('/public/products', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            search,
            minPrice,
            maxPrice,
            brand,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            inStock = true
        } = req.query;

        const filter = { isActive: true };

        // Stock Filter: Check if Total Stock > 0
        if (inStock === 'true') {
            filter['variants.stock'] = { $gt: 0 }; // At least one variant has stock
        }

        if (category) filter.category = category;
        if (brand) filter.brand = { $regex: brand, $options: 'i' };

        // Search
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { 'variants.variantName': { $regex: search, $options: 'i' } }
            ];
        }

        // Price Filter (Variants)
        if (minPrice || maxPrice) {
            filter['variants.price'] = {};
            if (minPrice) filter['variants.price'].$gte = Number(minPrice);
            if (maxPrice) filter['variants.price'].$lte = Number(maxPrice);
        }

        const skip = (page - 1) * limit;
        const sort = {};
        if (sortBy === 'price') {
            // Sort by min price found in variants
            sort['variants.price'] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const products = await Product.find(filter)
            .populate('shopId', 'name address rating contact')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const productsWithDetails = products.map(product => {
            // Determine display price (e.g., lowest price among variants)
            const prices = product.variants.map(v => v.price);
            const minP = prices.length > 0 ? Math.min(...prices) : 0;
            const maxP = prices.length > 0 ? Math.max(...prices) : 0;

            return {
                ...product.toObject(),
                displayPrice: minP === maxP ? minP : `${minP} - ${maxP}`, // For UI to show "100 - 200"
                totalStock: product.totalStock,
                stockStatus: product.stockStatus,
                shopName: product.shopId?.name,
                shopRating: product.shopId?.rating
            };
        });

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // --- Caching for Filters ---
        let filters = filterCache.get("product_filters");

        if (!filters) {
            // Calculate Global Min/Max Price and Distinct Values
            const priceAgg = await Product.aggregate([
                { $match: { isActive: true } },
                { $unwind: "$variants" },
                {
                    $group: {
                        _id: null,
                        min: { $min: "$variants.price" },
                        max: { $max: "$variants.price" }
                    }
                }
            ]);

            filters = {
                categories: await Product.distinct('category', { isActive: true }),
                brands: await Product.distinct('brand', { isActive: true, brand: { $ne: null } }),
                priceRange: priceAgg.length > 0 ? { min: priceAgg[0].min, max: priceAgg[0].max } : { min: 0, max: 0 }
            };

            // Cache for 5 minutes (300 seconds)
            filterCache.set("product_filters", filters, 300);
        }

        res.status(200).json({
            message: "Products retrieved successfully",
            products: productsWithDetails,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts,
                limit: Number(limit)
            },
            filters
        });

    } catch (error) {
        console.error("Error in fetching products:", error);
        res.status(500).json({ message: "Error in fetching products", error: error.message });
    }
});

// Get single product public details
ProductRouter.get('/public/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({ _id: productId, isActive: true })
            .populate('shopId', 'name address rating contact ownerId')
            .populate('rating.reviews.userId', 'name avatar');

        if (!product) return res.status(404).json({ message: "Product not found" });

        // Similar Products Logic
        const similarProducts = await Product.find({
            category: product.category,
            isActive: true,
            _id: { $ne: productId },
            'variants.stock': { $gt: 0 } // Check variant stock
        })
            .populate('shopId', 'name rating')
            .limit(4);

        res.status(200).json({
            message: "Product retrieved successfully",
            product: {
                ...product.toObject(),
                totalStock: product.totalStock,
                stockStatus: product.stockStatus
            },
            similarProducts
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
});

// POST /products/:id/reviews
ProductRouter.post('/:id/reviews', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const productId = req.params.id;
        const { rating, comment, images } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed this product
        const existingReviewIndex = product.rating.reviews.findIndex(
            review => review.userId.toString() === userId.toString()
        );

        if (existingReviewIndex >= 0) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Check if user has purchased this product (optional validation)
        // const hasPurchased = await Order.exists({
        //     userId,
        //     'items.productId': productId,
        //     status: 'completed'
        // });
        // if (!hasPurchased) {
        //     return res.status(403).json({ message: 'You must purchase this product before reviewing' });
        // }

        // Create new review
        const newReview = {
            userId,
            rating: Math.min(5, Math.max(1, parseInt(rating))),
            comment: comment.trim(),
            images: images || [],
            createdAt: new Date()
        };

        product.rating.reviews.push(newReview);

        // Recalculate average rating
        const totalRating = product.rating.reviews.reduce((sum, review) => sum + review.rating, 0);
        product.rating.average = +(totalRating / product.rating.reviews.length).toFixed(2);
        product.rating.count = product.rating.reviews.length;

        await product.save();

        // Populate user info
        await product.populate({
            path: 'rating.reviews.userId',
            select: 'name email avatar'
        });

        const savedReview = product.rating.reviews[product.rating.reviews.length - 1];

        res.status(201).json({
            message: 'Review added successfully',
            review: savedReview,
            averageRating: product.rating.average,
            totalReviews: product.rating.count
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /products/:id/reviews/:reviewId
ProductRouter.delete('/:id/reviews/:reviewId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { id: productId, reviewId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find review index
        const reviewIndex = product.rating.reviews.findIndex(
            review => review._id.toString() === reviewId && review.userId.toString() === userId.toString()
        );

        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        // Remove review
        product.rating.reviews.splice(reviewIndex, 1);

        // Recalculate average
        if (product.rating.reviews.length > 0) {
            const totalRating = product.rating.reviews.reduce((sum, review) => sum + review.rating, 0);
            product.rating.average = +(totalRating / product.rating.reviews.length).toFixed(2);
            product.rating.count = product.rating.reviews.length;
        } else {
            product.rating.average = 0;
            product.rating.count = 0;
        }

        await product.save();

        res.json({
            message: 'Review deleted successfully',
            averageRating: product.rating.average,
            totalReviews: product.rating.count
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = ProductRouter;