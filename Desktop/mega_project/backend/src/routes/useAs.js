
const express = require('express');
const ownRouter = express.Router();

const {
    addShopOwner,
    getShopOwnerById,
    getAllShopOwners,
    updateShopOwner,
    deleteShopOwner,

    addContractor,
    updateContractor,
    deleteContractor,
    getContractors,
    getContractorById,

} = require('../controllers/shopManager');




// Shop Owner Routes
ownRouter.post('/addshopowners', addShopOwner);              // Create a shop owner
ownRouter.get('/shop-owners', getAllShopOwners);           // Get all shop owners
ownRouter.get('/shop-owners/:id', getShopOwnerById);           // Get a specific shop owner
ownRouter.put('/shop-owners/:id', updateShopOwner);        // Update a shop owner
ownRouter.delete('/shop-owners/:id', deleteShopOwner);     // Delete a shop owner

// // Contractor Routes
ownRouter.post('/addcontractors', addContractor);             // Create a contractor
ownRouter.get('/contractors', getContractors);        // Get all contractors   
ownRouter.put('/contractors/:id', updateContractor);        // Update a contractor
ownRouter.get('/contractors/:id', getContractorById);       // Get a specific contractor
ownRouter.delete('/contractors/:id', deleteContractor);    // Delete a contractor

module.exports = ownRouter;