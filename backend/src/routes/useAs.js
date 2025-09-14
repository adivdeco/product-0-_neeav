// const express = require('express')

// const addMeAs = express.Router()



// addMeAs.post('/ShopOwner', addShopOwner)
// addMeAs.put('/updateShopOwner/:id', updateShopOwner)
// addMeAs.delete('/deleteShop', deleteShopOwner)


// addMeAs.post('/contractor', addShopOwner)
// addMeAs.put('/updateContractor/:id', updateShopOwner)
// addMeAs.delete('/deleteContractor', deleteShopOwner)


const express = require('express');
const router = express.Router();

// Import controller functions
const {
    addShopOwner,
    // updateShopOwner,
    // deleteShopOwner,

    // addContractor,
    // updateContractor,
    // deleteContractor,

    // getShopOwner,
    // getContractor,

    // getAllShopOwners,
    // getAllContractors
} = require('../controllers/shopManager');




// Shop Owner Routes
router.post('/shopowners', addShopOwner);              // Create a shop owner
// router.get('/shop-owners', getAllShopOwners);           // Get all shop owners
// router.get('/shop-owners/:id', getShopOwner);           // Get a specific shop owner
// router.put('/shop-owners/:id', updateShopOwner);        // Update a shop owner
// router.delete('/shop-owners/:id', deleteShopOwner);     // Delete a shop owner

// // Contractor Routes
// router.post('/contractors', addContractor);             // Create a contractor
// router.get('/contractors', getAllContractors);          // Get all contractors
// router.get('/contractors/:id', getContractor);          // Get a specific contractor
// router.put('/contractors/:id', updateContractor);       // Update a contractor
// router.delete('/contractors/:id', deleteContractor);    // Delete a contractor

module.exports = router;