billsRouter.get('/customer', async (req, res) => {
    try {
        const userId = req.session.userId;
        const role = req.session.role;

        // Enhanced authorization check
        if (!['store_owner', 'admin'].includes(role)) {
            return res.status(403).json({
                message: "Forbidden: You do not have access to view customers"
            });
        }

        // Validate session
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: Please login again"
            });
        }

        // Get shop with projection for efficiency
        const shop = await Shop.findOne({ ownerId: userId }).select('_id name');
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found for this user"
            });
        }

        // Use provided shopId or default to user's shop
        const shopId = req.query.shopId || shop._id;

        // Validate shopId format
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({
                message: "Invalid Shop ID format"
            });
        }

        // Additional security: Ensure user has access to the requested shop
        if (req.query.shopId) {
            const requestedShop = await Shop.findOne({
                _id: shopId,
                $or: [
                    { ownerId: userId },
                    { staffIds: userId } // if you have staff access
                ]
            });

            if (!requestedShop) {
                return res.status(403).json({
                    message: "Forbidden: You don't have access to this shop"
                });
            }
        }

        // Fetch customers with projection for efficiency
        const customers = await Customer.find({
            shopId: shopId,
            isActive: true // Only fetch active customers by default
        }).select('name phone email address type currentBalance creditAllowed isActive createdAt')
            .sort({ name: 1 }) // Sort alphabetically
            .lean(); // For better performance

        if (!customers.length) {
            return res.status(200).json({
                message: "No customers found for this shop",
                customers: []
            });
        }

        res.status(200).json({
            message: "Customers fetched successfully",
            count: customers.length,
            customers: customers
        });

    } catch (error) {
        console.error("Error fetching customers:", error);

        // More specific error messages
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Invalid ID format"
            });
        }

        res.status(500).json({
            message: "Internal server error while fetching customers"
        });
    }
});