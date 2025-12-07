const express = require('express');
const cartRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Product = require('../models/productSchema');
const User = require('../models/userSchema');

// Get cart
cartRouter.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.finduser._id)
            .populate('cart.productId', 'name price ProductImage stock unit category')
            .select('cart');

        // Calculate totals and check stock
        const cartItems = user.cart.map(item => {
            const product = item.productId;
            return {
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.ProductImage,
                stock: product.stock,
                unit: product.unit,
                category: product.category,
                quantity: item.quantity,
                subtotal: product.price * item.quantity,
                inStock: item.quantity <= product.stock
            };
        });

        const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            cart: cartItems,
            total,
            totalItems
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add to cart
cartRouter.post('/add', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId, quantity } = req.body;

        // Validate input
        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid product or quantity' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                message: `Only ${product.stock} items available in stock`,
                availableStock: product.stock
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if product already in cart
        const existingItemIndex = user.cart.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingItemIndex >= 0) {
            // Update quantity
            const newQuantity = user.cart[existingItemIndex].quantity + quantity;
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    message: `Cannot add more than available stock (${product.stock})`,
                    availableStock: product.stock
                });
            }
            user.cart[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            user.cart.push({ productId, quantity });
        }

        await user.save();

        // Get updated cart count
        const cartCount = user.cart.reduce((total, item) => total + item.quantity, 0);

        res.json({
            message: 'Product added to cart',
            cartCount,
            cartItem: {
                productId: product._id,
                name: product.name,
                quantity: existingItemIndex >= 0 ? user.cart[existingItemIndex].quantity : quantity,
                price: product.price
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update cart item quantity
cartRouter.put('/update/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} items available`,
                availableStock: product.stock
            });
        }

        const user = await User.findById(userId);
        const itemIndex = user.cart.findIndex(
            item => item.productId.toString() === productId
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
                name: product.name,
                quantity,
                price: product.price,
                subtotal: product.price * quantity
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove from cart
cartRouter.delete('/remove/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId } = req.params;

        const user = await User.findById(userId);
        user.cart = user.cart.filter(
            item => item.productId.toString() !== productId
        );

        await user.save();

        res.json({
            message: 'Product removed from cart',
            cartCount: user.cart.length
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