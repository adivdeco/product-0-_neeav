
const express = require('express');
const ownRouter = express.Router();
const Contractor = require('../models/contractorSchema');


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




// Add review to contractor
ownRouter.post('/:id/reviews', async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.params.id);

        if (!contractor) {
            return res.status(404).json({ message: 'Contractor not found' });
        }

        const { rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if user already reviewed
        const existingReview = contractor.rating.reviews.find(
            review => review.userId.toString() === req.user.id
        );

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this contractor' });
        }

        // Create new review
        const newReview = {
            userId: req.user.id,
            rating: parseInt(rating),
            comment: comment.trim(),
            createdAt: new Date()
        };

        // Add review to contractor
        contractor.rating.reviews.push(newReview);

        // Recalculate average rating
        const totalRating = contractor.rating.reviews.reduce((sum, review) => sum + review.rating, 0);
        contractor.rating.average = totalRating / contractor.rating.reviews.length;
        contractor.rating.count = contractor.rating.reviews.length;

        // Update updatedAt
        contractor.updatedAt = new Date();

        await contractor.save();

        // Populate user info for response
        await contractor.populate('rating.reviews.userId', 'name email');

        res.status(201).json({
            message: 'Review added successfully',
            review: newReview,
            averageRating: contractor.rating.average,
            totalReviews: contractor.rating.count
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get contractor reviews with pagination
ownRouter.get('/:id/reviews', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const contractor = await Contractor.findById(req.params.id)
            .select('rating.reviews')
            .populate('rating.reviews.userId', 'name email')
            .slice('rating.reviews', [skip, limit]);

        if (!contractor) {
            return res.status(404).json({ message: 'Contractor not found' });
        }

        const totalReviews = contractor.rating.count;
        const totalPages = Math.ceil(totalReviews / limit);

        res.json({
            reviews: contractor.rating.reviews,
            currentPage: page,
            totalPages,
            totalReviews,
            averageRating: contractor.rating.average
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = ownRouter;