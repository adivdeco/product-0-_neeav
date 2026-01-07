const express = require('express');
const cartRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Product = require('../models/productSchema');
const User = require('../models/userSchema');

// Get cart
// Get cart
cartRouter.get('/crt_dta', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.finduser._id)
            .populate('cart.productId', 'name price ProductImage stock unit category variants')
            .select('cart');

        // Calculate totals and check stock
        const cartItems = user.cart.map(item => {
            const product = item.productId;
            if (!product) return null; // Handle deleted products

            let price = product.price;
            let stock = product.stock;
            let unit = product.unit;
            let variantName = null;
            let image = product.ProductImage;

            // If item has a variantId, fetch specific variant details
            if (item.variantId && product.variants && product.variants.length > 0) {
                const variant = product.variants.find(v => v._id.toString() === item.variantId);
                if (variant) {
                    price = variant.price;
                    stock = variant.stock;
                    unit = variant.unit || unit;
                    variantName = variant.variantName || `${variant.size} ${variant.unit}`;
                    // Optionally use variant image if available (not in current schema, but good to be safe)
                }
            } else if (product.variants && product.variants.length > 0 && !price) {
                // Fallback if no variantId but product has variants (logic: maybe default to first variant?)
                // Or if data is old/corrupt. Ideally we need a price.
                const firstVariant = product.variants[0];
                price = firstVariant.price;
                stock = firstVariant.stock;
                unit = firstVariant.unit;
            }

            return {
                productId: product._id,
                variantId: item.variantId,
                name: product.name,
                variantName: variantName,
                price: price || 0,
                image: image,
                stock: stock || 0,
                unit: unit,
                category: product.category,
                quantity: item.quantity,
                subtotal: (price || 0) * item.quantity,
                inStock: item.quantity <= (stock || 0)
            };
        }).filter(item => item !== null); // Remove nulls

        const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            cart: cartItems,
            total,
            totalItems
        });

    } catch (error) {
        console.error("Cart Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add to cart
// Add to cart
cartRouter.post('/add', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId, quantity, variantId } = req.body;

        // Validate input
        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid product or quantity' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let price = product.price;
        let stock = product.stock;
        let variantName = null;

        // Handle Variant Logic
        if (variantId) {
            const variant = product.variants.find(v => v._id.toString() === variantId);
            if (!variant) {
                return res.status(404).json({ message: 'Variant not found' });
            }
            price = variant.price;
            stock = variant.stock;
            variantName = variant.variantName;
        } else if (!price && product.variants && product.variants.length > 0) {
            // If product relies on variants but none provided
            return res.status(400).json({ message: 'Please select a variant' });
        }

        if (stock < quantity) {
            return res.status(400).json({
                message: `Only ${stock} items available in stock`,
                availableStock: stock
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if product with SAME variant already in cart
        const existingItemIndex = user.cart.findIndex(item =>
            item.productId.toString() === productId &&
            (item.variantId === variantId || (!item.variantId && !variantId))
        );

        if (existingItemIndex >= 0) {
            // Update quantity
            const newQuantity = user.cart[existingItemIndex].quantity + quantity;
            if (newQuantity > stock) {
                return res.status(400).json({
                    message: `Cannot add more than available stock (${stock})`,
                    availableStock: stock
                });
            }
            user.cart[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            user.cart.push({ productId, variantId, quantity });
        }

        await user.save();

        // Get updated cart count
        const cartCount = user.cart.reduce((total, item) => total + item.quantity, 0);

        res.json({
            message: 'Product added to cart',
            cartCount,
            cartItem: {
                productId: product._id,
                variantId: variantId,
                name: product.name,
                variantName: variantName,
                quantity: existingItemIndex >= 0 ? user.cart[existingItemIndex].quantity : quantity,
                price: price
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update cart item quantity
// Update cart item quantity
cartRouter.put('/update/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;
        const { quantity, variantId } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let stock = product.stock;
        let price = product.price;

        if (variantId) {
            const variant = product.variants.find(v => v._id.toString() === variantId);
            if (variant) {
                stock = variant.stock;
                price = variant.price;
            }
        } else if (product.variants && product.variants.length > 0) {
            // Try to match if existing item in cart used a default first variant price but had no variantId saved?
            // Should not happen with new logic, but if so, fallback
            const firstVariant = product.variants[0];
            stock = firstVariant.stock;
            price = firstVariant.price;
        }

        if (quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items available`,
                availableStock: stock
            });
        }

        const user = await User.findById(userId);
        const itemIndex = user.cart.findIndex(item =>
            item.productId.toString() === productId &&
            (item.variantId === variantId || (!item.variantId && !variantId))
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        user.cart[itemIndex].quantity = quantity;
        await user.save();

        res.json({
            message: 'Cart updated successfully',
            cartItem: {
                productId: product._id,
                variantId: variantId,
                name: product.name,
                quantity,
                price: price,
                subtotal: (price || 0) * quantity
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove from cart
// Remove from cart
cartRouter.delete('/remove/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;
        const { variantId } = req.query; // Get variantId from query params

        const user = await User.findById(userId);
        user.cart = user.cart.filter(item =>
            !(item.productId.toString() === productId &&
                (item.variantId === variantId || (!item.variantId && !variantId)))
        );

        await user.save();

        res.json({
            message: 'Product removed from cart',
            cartCount: user.cart.length,
            productId, // Send back ID to help frontend update state
            variantId
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Clear cart
cartRouter.delete('/clear', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const user = await User.findById(userId);

        user.cart = [];
        await user.save();

        res.json({ message: 'Cart cleared successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = cartRouter;