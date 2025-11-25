const express = require('express');
const BuyRequest = require('../models/buyRequest');
const Product = require('../models/productSchema');
const Notification = require('../models/notification');
const User = require('../models/userSchema');
const Shop = require('../models/shopSchema');
const BuyRequestRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');


BuyRequestRouter.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId, quantity, message, shippingAddress, paymentMethod } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        // Get product details
        const product = await Product.findById(productId).populate('shopId');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Get shop owner
        const shop = await Shop.findById(product.shopId).populate('ownerId');
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Calculate total price
        const taxAmount = (product.price * quantity * product.taxRate) / 100;
        const totalPrice = (product.price * quantity) + taxAmount;

        // Create buy request
        const buyRequest = await BuyRequest.create({
            product: productId,
            user: userId,
            shopOwner: shop.ownerId._id,
            quantity,
            totalPrice,
            message: message || '',
            shippingAddress: shippingAddress || {},
            paymentMethod: paymentMethod || 'cash_on_delivery',
            contactInfo: {
                phone: req.finduser.phone,
                email: req.finduser.email
            }
        });

        // Populate the buy request for response
        const populatedRequest = await BuyRequest.findById(buyRequest._id)
            .populate('product', 'name price images')
            .populate('user', 'name email phone')
            .populate('shopOwner', 'name email phone');

        // Create notification for shop owner
        const notification = await Notification.create({
            user: shop.ownerId._id,
            type: 'buy_request',
            title: 'New Purchase Request',
            message: `You have a new purchase request for ${quantity} ${product.name} from ${req.finduser.name}`,
            relatedBuyRequest: buyRequest._id,
            actionRequired: true,
            priority: 'high'
        });

        // Real-time notification to shop owner
        const shopOwnerSocketId = global.users.get(shop.ownerId._id.toString());
        if (shopOwnerSocketId) {
            global.io.to(shopOwnerSocketId).emit('new_buy_request', {
                buyRequest: populatedRequest,
                notification: {
                    title: 'New Purchase Request',
                    message: `New purchase request for ${product.name}`
                }
            });

            global.io.to(shopOwnerSocketId).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: shop.ownerId._id,
                    isRead: false
                })
            });
        }

        res.status(201).json({
            message: 'Buy request sent successfully',
            buyRequest: populatedRequest
        });

    } catch (error) {
        console.error('Create buy request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get buy requests for shop owner
BuyRequestRouter.get('/shop-owner/requests', authMiddleware, async (req, res) => {
    try {
        const shopOwnerId = req.finduser._id;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { shopOwner: shopOwnerId };
        if (status) filter.status = status;

        const requests = await BuyRequest.find(filter)
            .populate('product', 'name price images category brand')
            .populate('user', 'name email phone avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await BuyRequest.countDocuments(filter);

        res.json({
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        console.error('Get shop owner requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's buy requests
BuyRequestRouter.get('/my-requests', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { user: userId };
        if (status) filter.status = status;

        const requests = await BuyRequest.find(filter)
            .populate('product', 'name price images category brand')
            .populate('shopOwner', 'name email phone shopName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await BuyRequest.countDocuments(filter);

        res.json({
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        console.error('Get user requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Accept buy request
BuyRequestRouter.put('/:id/accept', authMiddleware, async (req, res) => {
    try {
        const shopOwnerId = req.finduser._id;
        const { id } = req.params;
        const { expectedDelivery, message } = req.body;

        const buyRequest = await BuyRequest.findOne({
            _id: id,
            shopOwner: shopOwnerId,
            status: 'pending'
        }).populate('product').populate('user');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }

        // Check stock again
        if (buyRequest.product.stock < buyRequest.quantity) {
            return res.status(400).json({
                message: 'Insufficient stock to fulfill this request'
            });
        }

        // Update product stock
        await Product.findByIdAndUpdate(
            buyRequest.product._id,
            { $inc: { stock: -buyRequest.quantity } }
        );

        // Update buy request status
        buyRequest.status = 'accepted';
        buyRequest.expectedDelivery = expectedDelivery;
        await buyRequest.save();

        // Create notification for user
        const notification = await Notification.create({
            user: buyRequest.user._id,
            type: 'buy_request_accepted',
            title: 'Purchase Request Accepted',
            message: `Your purchase request for ${buyRequest.product.name} has been accepted by the seller`,
            relatedBuyRequest: buyRequest._id,
            priority: 'medium'
        });

        // Real-time notification to user
        const userSocketId = global.users.get(buyRequest.user._id.toString());
        if (userSocketId) {
            global.io.to(userSocketId).emit('buy_request_accepted', {
                buyRequest,
                notification: {
                    title: 'Purchase Accepted',
                    message: `Your purchase request for ${buyRequest.product.name} has been accepted`
                }
            });

            global.io.to(userSocketId).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: buyRequest.user._id,
                    isRead: false
                })
            });
        }

        res.json({
            message: 'Buy request accepted successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Accept buy request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Reject buy request
BuyRequestRouter.put('/:id/reject', authMiddleware, async (req, res) => {
    try {
        const shopOwnerId = req.finduser._id;
        const { id } = req.params;
        const { reason } = req.body;

        const buyRequest = await BuyRequest.findOne({
            _id: id,
            shopOwner: shopOwnerId,
            status: 'pending'
        }).populate('product').populate('user');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }

        buyRequest.status = 'rejected';
        buyRequest.rejectionReason = reason;
        await buyRequest.save();

        // Create notification for user
        const notification = await Notification.create({
            user: buyRequest.user._id,
            type: 'buy_request_rejected',
            title: 'Purchase Request Declined',
            message: `Your purchase request for ${buyRequest.product.name} was declined. ${reason ? `Reason: ${reason}` : ''}`,
            relatedBuyRequest: buyRequest._id,
            priority: 'medium'
        });

        // Real-time notification to user
        const userSocketId = global.users.get(buyRequest.user._id.toString());
        if (userSocketId) {
            global.io.to(userSocketId).emit('buy_request_rejected', {
                buyRequest,
                notification: {
                    title: 'Purchase Declined',
                    message: `Your purchase request for ${buyRequest.product.name} was declined`
                }
            });

            global.io.to(userSocketId).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: buyRequest.user._id,
                    isRead: false
                })
            });
        }

        res.json({
            message: 'Buy request declined successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Reject buy request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User cancels buy request
BuyRequestRouter.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { id } = req.params;

        const buyRequest = await BuyRequest.findOne({
            _id: id,
            user: userId,
            status: 'pending'
        }).populate('shopOwner').populate('product');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Request not found or cannot be cancelled' });
        }

        buyRequest.status = 'cancelled';
        await buyRequest.save();

        // Notify shop owner
        const notification = await Notification.create({
            user: buyRequest.shopOwner._id,
            type: 'status_updated',
            title: 'Purchase Request Cancelled',
            message: `Purchase request for ${buyRequest.product.name} has been cancelled by the buyer`,
            relatedBuyRequest: buyRequest._id
        });

        // Real-time notification to shop owner
        const shopOwnerSocketId = global.users.get(buyRequest.shopOwner._id.toString());
        if (shopOwnerSocketId) {
            global.io.to(shopOwnerSocketId).emit('buy_request_cancelled', {
                buyRequest,
                notification: {
                    title: 'Purchase Cancelled',
                    message: `Purchase request for ${buyRequest.product.name} was cancelled`
                }
            });

            global.io.to(shopOwnerSocketId).emit('new_notification', {
                notification,
                unreadCount: await Notification.countDocuments({
                    user: buyRequest.shopOwner._id,
                    isRead: false
                })
            });
        }

        res.json({
            message: 'Buy request cancelled successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Cancel buy request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = BuyRequestRouter;