const express = require('express');
const BuyRequest = require('../models/buyRequest');
const Product = require('../models/productSchema');
const Notification = require('../models/notification');
const User = require('../models/userSchema');
const Shop = require('../models/shopSchema');
const BuyRequestRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Create buy request
BuyRequestRouter.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { productId, quantity, message, shippingAddress, paymentMethod, saveAddress } = req.body;

        console.log('📦 Buy request received:', { productId, quantity, userId });

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        // Get product details
        const product = await Product.findById(productId).populate('shopId ProductImage');
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
        if (!shop || !shop.ownerId) {
            return res.status(404).json({ message: 'Shop or owner not found' });
        }

        // Calculate total price
        const taxAmount = (product.price * quantity * (product.taxRate || 18)) / 100;
        const shippingCost = product.shipping?.isFree ? 0 : (product.shipping?.cost || 50);
        const totalPrice = (product.price * quantity) + taxAmount + shippingCost;

        // Create buy request
        const buyRequest = await BuyRequest.create({
            product: productId,
            user: userId,
            shopOwner: shop.ownerId._id,
            quantity,
            totalPrice,
            message: message || `Purchase request for ${quantity} ${product.name}`,
            shippingAddress: {
                ...shippingAddress,
                contactPerson: shippingAddress?.contactPerson || req.finduser.name,
                contactPhone: shippingAddress?.contactPhone || req.finduser.phone
            },
            paymentMethod: paymentMethod || 'cash_on_delivery',
            contactInfo: {
                phone: req.finduser.phone || shippingAddress?.contactPhone,
                email: req.finduser.email
            }
        });

        // Save address to user if requested
        if (saveAddress && shippingAddress) {
            await User.findByIdAndUpdate(userId, {
                $addToSet: {
                    addresses: {
                        ...shippingAddress,
                        isDefault: true
                    }
                }
            });
        }

        // Populate the buy request for response
        const populatedRequest = await BuyRequest.findById(buyRequest._id)
            .populate('product', 'name price ProductImage category brand taxRate shipping unit')
            .populate('user', 'name email phone avatar')
            .populate('shopOwner', 'name email phone storeDetails');

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
        try {
            const shopOwnerSocketId = global.users.get(shop.ownerId._id.toString());
            console.log('🔍 Shop owner socket ID:', shopOwnerSocketId);

            if (shopOwnerSocketId && global.io) {
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
        } catch (socketError) {
            console.error('Socket emission error:', socketError);
        }

        res.status(201).json({
            message: 'Buy request sent successfully',
            buyRequest: populatedRequest
        });

    } catch (error) {
        console.error('Create buy request error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
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
            .populate('product', 'name price ProductImage category brand taxRate shipping unit')
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
            .populate('product', 'name price ProductImage category brand taxRate shipping unit')
            .populate('shopOwner', 'name email phone storeDetails')
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
        const { expectedDelivery } = req.body;

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
            message: `Your purchase request for ${buyRequest.product.name} has been accepted. Expected delivery: ${new Date(expectedDelivery).toLocaleDateString()}`,
            relatedBuyRequest: buyRequest._id,
            priority: 'medium'
        });

        // Real-time notification to user
        const userSocketId = global.users.get(buyRequest.user._id.toString());
        if (userSocketId && global.io) {
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
        if (userSocketId && global.io) {
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

// MARK AS SHIPPED - NEW ENDPOINT
BuyRequestRouter.put('/:id/ship', authMiddleware, async (req, res) => {
    try {
        const shopOwnerId = req.finduser._id;
        const { id } = req.params;

        const buyRequest = await BuyRequest.findOne({
            _id: id,
            shopOwner: shopOwnerId,
            status: 'accepted'
        }).populate('product').populate('user');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Request not found or cannot be shipped' });
        }

        buyRequest.status = 'shipped';
        await buyRequest.save();

        // Create notification for user
        const notification = await Notification.create({
            user: buyRequest.user._id,
            type: 'order_shipped',
            title: 'Order Shipped',
            message: `Your order for ${buyRequest.product.name} has been shipped and is on its way!`,
            relatedBuyRequest: buyRequest._id,
            priority: 'medium'
        });

        // Real-time notification to user
        const userSocketId = global.users.get(buyRequest.user._id.toString());
        if (userSocketId && global.io) {
            global.io.to(userSocketId).emit('order_shipped', {
                buyRequest,
                notification: {
                    title: 'Order Shipped',
                    message: `Your order for ${buyRequest.product.name} is on its way!`
                }
            });
        }

        res.json({
            message: 'Order marked as shipped successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Ship order error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// MARK AS COMPLETED - FIXED ENDPOINT
BuyRequestRouter.put('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const shopOwnerId = req.finduser._id;
        const { id } = req.params;

        const buyRequest = await BuyRequest.findOne({
            _id: id,
            shopOwner: shopOwnerId,
            status: { $in: ['accepted', 'shipped'] }
        }).populate('product').populate('user');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Request not found or cannot be completed' });
        }

        buyRequest.status = 'completed';
        buyRequest.actualDelivery = new Date();
        await buyRequest.save();

        // Create notification for user
        const notification = await Notification.create({
            user: buyRequest.user._id,
            type: 'order_delivered',
            title: 'Order Delivered',
            message: `Your order for ${buyRequest.product.name} has been delivered successfully!`,
            relatedBuyRequest: buyRequest._id,
            priority: 'medium'
        });

        // Real-time notification to user
        const userSocketId = global.users.get(buyRequest.user._id.toString());
        if (userSocketId && global.io) {
            global.io.to(userSocketId).emit('order_delivered', {
                buyRequest,
                notification: {
                    title: 'Order Delivered',
                    message: `Your order for ${buyRequest.product.name} has been delivered!`
                }
            });
        }

        res.json({
            message: 'Order marked as completed successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Complete order error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User cancels buy request
BuyRequestRouter.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { id } = req.params;
        const { reason } = req.body;

        const buyRequest = await BuyRequest.findOne({
            _id: id,
            user: userId,
            status: { $in: ['pending', 'accepted'] }
        }).populate('shopOwner').populate('product');

        if (!buyRequest) {
            return res.status(404).json({ message: 'Request not found or cannot be cancelled' });
        }

        // If order was accepted, restore stock
        if (buyRequest.status === 'accepted') {
            await Product.findByIdAndUpdate(
                buyRequest.product._id,
                { $inc: { stock: buyRequest.quantity } }
            );
        }

        buyRequest.status = 'cancelled';
        buyRequest.cancellationReason = reason;
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
        if (shopOwnerSocketId && global.io) {
            global.io.to(shopOwnerSocketId).emit('buy_request_cancelled', {
                buyRequest,
                notification: {
                    title: 'Purchase Cancelled',
                    message: `Purchase request for ${buyRequest.product.name} was cancelled`
                }
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

// Mark buy request as received by user
BuyRequestRouter.put('/:id/received', authMiddleware, async (req, res) => {
    try {
        const userId = req.finduser._id;
        const { id } = req.params;

        const buyRequest = await BuyRequest.findOne({
            _id: id,
            user: userId,
            status: { $in: ['accepted', 'shipped'] }
        }).populate('shopOwner').populate('product');

        if (!buyRequest) {
            return res.status(404).json({
                message: 'Request not found or cannot be marked as received'
            });
        }

        buyRequest.status = 'completed';
        buyRequest.actualDelivery = new Date();
        await buyRequest.save();

        // Notify shop owner
        await Notification.create({
            user: buyRequest.shopOwner._id,
            type: 'order_delivered',
            title: 'Order Delivered',
            message: `Customer confirmed delivery: ${buyRequest.product.name}`,
            relatedBuyRequest: buyRequest._id
        });

        res.json({
            message: 'Order marked as received successfully',
            buyRequest
        });

    } catch (error) {
        console.error('Mark as received error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = BuyRequestRouter;