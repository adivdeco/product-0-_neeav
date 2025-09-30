// const express = require('express')

// const addMeAs = express.Router()



// addMeAs.post('/ShopOwner', addShopOwner)
// addMeAs.put('/updateShopOwner/:id', updateShopOwner)
// addMeAs.delete('/deleteShop', deleteShopOwner)


// addMeAs.post('/contractor', addShopOwner)
// addMeAs.put('/updateContractor/:id', updateShopOwner)
// addMeAs.delete('/deleteContractor', deleteShopOwner)


const express = require('express');
const ownRouter = express.Router();

// Import controller functions
const {
    addShopOwner,
    // updateShopOwner,
    // deleteShopOwner,

    addContractor,
    updateContractor,
    deleteContractor,

    // getShopOwner,
    getContractors,
    getContractorById,

    // getAllShopOwners,
    // getAllContractors
} = require('../controllers/shopManager');




// Shop Owner Routes
ownRouter.post('/addshopowners', addShopOwner);              // Create a shop owner
// router.get('/shop-owners', getAllShopOwners);           // Get all shop owners
// router.get('/shop-owners/:id', getShopOwner);           // Get a specific shop owner
// router.put('/shop-owners/:id', updateShopOwner);        // Update a shop owner
// router.delete('/shop-owners/:id', deleteShopOwner);     // Delete a shop owner

// // Contractor Routes
ownRouter.post('/addcontractors', addContractor);             // Create a contractor
ownRouter.get('/contractors', getContractors);        // Get all contractors   
ownRouter.put('/contractors/:id', updateContractor);        // Update a contractor
ownRouter.get('/contractors/:id', getContractorById);       // Get a specific contractor
ownRouter.delete('/contractors/:id', deleteContractor);    // Delete a contractor

module.exports = ownRouter;