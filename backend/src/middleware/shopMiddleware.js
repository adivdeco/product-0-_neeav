// ensureOwner middleware
const Shop = require('../models/shopSchema');

async function ensureShopOwner(req, res, next) {
    const userId = req.finduser.userId;
    if (!userId) return res.status(401).send('Login required');

    const shopId = req.params.shopId; // or req.body.shopId
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).send('Shop not found');

    if (shop.ownerId.toString() !== userId.toString() && req.finduser.role !== 'admin') {
        return res.status(403).send('Forbidden: not owner');
    }

    req.shop = shop;
    next();
}

module.exports = ensureShopOwner