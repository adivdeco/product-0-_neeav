const express = require('express')
const Product = require('../models/productSchema')
const authMiddleware = require('../middleware/authMiddleware')
const Shop = require('../models/shopSchema')
const ProductRouter = express.Router()





ProductRouter.post('/add_items', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const role = req.finduser.role

        if (role !== 'store_owner') {
            return res.status(401).json({ message: 'user must to be store_owner' });
        }


        const store = await Shop.findOne({ ownerId: userId });
        if (!store) {
            return res.status(400).json({
                message: "Shop not found for this user"
            });
        }

        const {
            name,
            description,
            category,
            brand,
            model,
            size,
            weight,
            color,
            price,
            costPrice,
            taxRate,
            stock,
            minStockLevel,
            unit,
            supplier,
            hsnCode,
            isActive,
            avatar
        } = req.body;


        if (!name || !category || !price || !unit) {
            return res.status(400).json({
                message: "Missing required fields: name, category, price, and unit are required"
            });
        }

        const validCategories = [
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
        ];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid category",
                validCategories: validCategories
            });
        }

        const validUnits = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'];
        if (!validUnits.includes(unit)) {
            return res.status(400).json({
                message: "Invalid unit",
                validUnits: validUnits
            });
        }

        const newProduct = new Product({
            shopId: store._id,
            name: name.trim(),
            description: description || '',
            category,
            brand: brand || '',
            model: model || '',
            size: size || '',
            weight: weight || null,
            color: color || '',
            price,
            costPrice: costPrice || null,
            taxRate: taxRate || 18,
            stock: stock || 0,
            minStockLevel: minStockLevel || 5,
            unit,
            supplier: supplier || '',
            hsnCode: hsnCode || '',
            isActive: isActive !== undefined ? isActive : true,
            productImage: avatar || ''
        });


        const savedProduct = await newProduct.save();

        const populatedProduct = await Product.findById(savedProduct._id)
            .populate('shopId', 'name address contact')

        res.status(201).json({
            message: "Product created successfully",
            product: populatedProduct,
            stockStatus: savedProduct.stockStatus
        });

    } catch (error) {
        console.error("Error in creating product:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Product with similar details already exists"
            });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: "Validation error",
                errors: errors
            });
        }

        res.status(500).json({
            message: "Error in creating product",
            error: error.message
        });
    }
});

ProductRouter.get('/allProduct', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const role = req.finduser.role

        if (role !== 'store_owner') {
            return res.status(401).json({ message: 'user must to be store_owner' });
        }

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) {
            return res.status(400).json({
                message: "Shop not found for this user"
            });
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


        if (category) {
            filter.category = category;
        }


        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }


        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }


        if (stockStatus) {
            if (stockStatus === 'out_of_stock') {
                filter.stock = 0;
            } else if (stockStatus === 'low_stock') {
                filter.$expr = { $lte: ['$stock', '$minStockLevel'] };
                filter.stock = { $gt: 0 }; // Ensure stock is not zero
            } else if (stockStatus === 'in_stock') {
                filter.$expr = { $gt: ['$stock', '$minStockLevel'] };
            }
        }


        const skip = (page - 1) * limit;


        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;


        const products = await Product.find(filter)
            .populate('shopId', 'name address')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean(); // Convert to plain JavaScript objects


        const productsWithStatus = products.map(product => {
            let stockStatus;
            if (product.stock === 0) {
                stockStatus = 'Out of Stock';
            } else if (product.stock <= product.minStockLevel) {
                stockStatus = 'Low Stock';
            } else {
                stockStatus = 'In Stock';
            }

            return {
                ...product,
                stockStatus
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
        res.status(500).json({
            message: "Error in fetching products",
            error: error.message
        });
    }
});

ProductRouter.delete('/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) {
            return res.status(400).json({
                message: "Shop not found for this user"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            shopId: store._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you don't have permission to delete this product"
            });
        }

        // Option 1: Hard delete (completely remove from database)
        await Product.findByIdAndDelete(productId);

        // Option 2: Soft delete (recommended - set isActive to false)
        // await Product.findByIdAndUpdate(
        //     productId, 
        //     { 
        //         isActive: false,
        //         updatedAt: Date.now()
        //     }
        // );

        res.status(200).json({
            message: "Product deleted successfully",
            deletedProduct: {
                id: product._id,
                name: product.name,
                category: product.category
            }
        });

    } catch (error) {
        console.error("Error in deleting product:", error);

        // Handle invalid product ID format
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Invalid product ID format"
            });
        }

        res.status(500).json({
            message: "Error in deleting product",
            error: error.message
        });
    }
});


// Update product status (isActive)
ProductRouter.patch('/:productId/status', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;
        const { isActive } = req.body;

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) {
            return res.status(400).json({
                message: "Shop not found for this user"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            shopId: store._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        product.isActive = isActive;
        product.updatedAt = Date.now();
        await product.save();

        res.status(200).json({
            message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
            product: {
                id: product._id,
                name: product.name,
                isActive: product.isActive
            }
        });

    } catch (error) {
        console.error("Error updating product status:", error);
        res.status(500).json({
            message: "Error updating product status",
            error: error.message
        });
    }
});

// Update product stock
ProductRouter.patch('/:productId/stock', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;
        const { stock, minStockLevel } = req.body;

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) {
            return res.status(400).json({
                message: "Shop not found for this user"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            shopId: store._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const updateData = { updatedAt: Date.now() };
        if (stock !== undefined) updateData.stock = stock;
        if (minStockLevel !== undefined) updateData.minStockLevel = minStockLevel;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true }
        ).populate('shopId', 'name address');

        res.status(200).json({
            message: "Product stock updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error updating product stock:", error);
        res.status(500).json({
            message: "Error updating product stock",
            error: error.message
        });
    }
});

// Update product details
ProductRouter.put('/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;
        const updateData = req.body;

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) {
            return res.status(400).json({
                message: "Shop not found for this user"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            shopId: store._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Remove fields that shouldn't be updated
        delete updateData.shopId;
        delete updateData._id;
        delete updateData.createdAt;

        updateData.updatedAt = Date.now();

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('shopId', 'name address');

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error updating product:", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Product name already exists"
            });
        }

        res.status(500).json({
            message: "Error updating product",
            error: error.message
        });
    }
});

// Get single product by ID
ProductRouter.get('/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;

        const store = await Shop.findOne({ ownerId: userId });
        if (!store) {
            return res.status(400).json({
                message: "Shop not found for this user"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            shopId: store._id
        }).populate('shopId', 'name address');

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product retrieved successfully",
            product
        });

    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            message: "Error fetching product",
            error: error.message
        });
    }
});

//  user based route frr products 



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

        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        // Category filter
        if (category) {
            filter.category = category;
        }

        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Brand filter
        if (brand) {
            filter.brand = { $regex: brand, $options: 'i' };
        }

        const skip = (page - 1) * limit;
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get products with shop information
        const products = await Product.find(filter)
            .populate('shopId', 'name address rating contact')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean();

        const productsWithDetails = products.map(product => {
            let stockStatus;
            if (product.stock === 0) {
                stockStatus = 'Out of Stock';
            } else if (product.stock <= product.minStockLevel) {
                stockStatus = 'Low Stock';
            } else {
                stockStatus = 'In Stock';
            }

            return {
                ...product,
                stockStatus,
                shopName: product.shopId?.name,
                shopRating: product.shopId?.rating
            };
        });

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            message: "Products retrieved successfully",
            products: productsWithDetails,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                limit: Number(limit)
            },
            filters: {
                categories: await Product.distinct('category', { isActive: true }),
                brands: await Product.distinct('brand', { isActive: true, brand: { $ne: null } }),
                priceRange: {
                    min: await Product.findOne({ isActive: true }).sort({ price: 1 }).select('price'),
                    max: await Product.findOne({ isActive: true }).sort({ price: -1 }).select('price')
                }
            }
        });

    } catch (error) {
        console.error("Error in fetching products:", error);
        res.status(500).json({
            message: "Error in fetching products",
            error: error.message
        });
    }
});

// Get single product details
ProductRouter.get('/public/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        }).populate('shopId', 'name address rating contact ownerId');

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Get similar products from same category
        const similarProducts = await Product.find({
            category: product.category,
            isActive: true,
            _id: { $ne: productId },
            stock: { $gt: 0 }
        })
            .populate('shopId', 'name rating')
            .limit(4)
            .lean();

        res.status(200).json({
            message: "Product retrieved successfully",
            product,
            similarProducts
        });

    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            message: "Error fetching product",
            error: error.message
        });
    }
});


module.exports = ProductRouter;