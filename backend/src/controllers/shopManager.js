const Shop = require("../models/shopSchema")
const mongoose = require('mongoose')
const User = require("../models/userSchema")
const bcrypt = require('bcrypt');
const Contractor = require("../models/contractorSchema");



const addShopOwner = async (req, res) => {

    try {

        const userId = req.session.userId
        const role = req.session.role



        if (role != 'co-admin' && role != "admin") {
            return res.status(403).send("Forbidden: You do not have asses to addShop ")
        }

        const { shopName, contact, address, ownerName, categories, image } = req.body;
        const phone = contact?.phone;
        const email = contact?.email;
        const password = contact?.password
        const city = address?.city;
        const state = address?.state;
        const pincode = address?.pincode;

        // Validate required fields
        if (!shopName || !ownerName || !contact || !phone || !address || !city || !state || !pincode || !email || !password) {
            return res.status(400).json({
                message: "Missing required fields: name, contact.phone, address.city, address.state, address.pincode are required"
            });
        }

        const existingShop = await Shop.findOne({
            shopName,
            'contact.email': contact.email,
            'contact.phone': contact.phone
        });

        if (existingShop) {
            return res.status(409).json({
                message: "You already have a shop with this name"
            });
        }

        // Does a User exist for this owner (by email or phone)?
        let ownerUser = null;
        ownerUser = await User.findOne({ $or: [{ email: email }, { phone }] });


        let tempPasswordPlain = null;

        if (!ownerUser) {
            // create a new user with  password input ..
            tempPasswordPlain = password;
            const hashed = await bcrypt.hash(tempPasswordPlain, 10);

            const newUserPayload = {
                name: ownerName,
                email: email,
                phone,
                password: hashed,
                role: 'store_owner',
                address: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode
                },
                storeDetails: {
                    storeName: shopName,
                    productCategories: categories
                }
                // avatar: image[0].url
            };

            ownerUser = await User.create(newUserPayload);

        } else {
            if (ownerUser.role !== 'store_owner') {
                // Use findByIdAndUpdate to reliably update nested fields and arrays
                ownerUser = await User.findByIdAndUpdate(ownerUser._id, {
                    $set: {
                        role: 'store_owner',
                        email: email,
                        phone: phone,
                        address: {
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            pincode: address.pincode
                        },
                        storeDetails: {
                            storeName: shopName,
                            productCategories: Array.isArray(categories) ? categories : []
                        }
                    }
                }, { new: true, runValidators: true });

                console.log('ownerUser updated via findByIdAndUpdate:', { id: ownerUser?._id, storeDetails: ownerUser?.storeDetails });
            }
        }

        // Create shop with ownerId reference
        const newShopPayload = {
            ...req.body,
            createdBy: userId,
            ownerId: ownerUser._id
        };

        const newShop = await Shop.create(newShopPayload)


        res.status(201).send({
            message: "New_Shop added  successfully",
            newShop,
            ownerUser: {
                _id: ownerUser._id,
                email: ownerUser.email,
                name: ownerUser.name
            }
        });

    }
    catch (error) {
        console.error('Error in adding New Shop:', error);

        // Duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Shop with similar details already exists'
            });
        }

        // send a 500 JSON response (avoid chaining .json after sendStatus)
        res.status(500).json({ message: 'Internal server error' });
    };

}

const getAllShopOwners = async (req, res) => {
    try {
        const { page = 1, limit = 10, service, city, search } = req.query;
        const filter = { isActive: true };

        if (service) filter.services = service;
        if (city) filter['address.city'] = new RegExp(city, 'i');
        if (search) {
            filter.$or = [
                { shopName: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        const shop = await Shop.find(filter)

            .populate('ownerId', 'name email phone avatar storeDetails')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Shop.countDocuments(filter);

        res.status(200).json({
            shop,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching shops",
            error: error.message
        });
    }
};

const getShopOwnerById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id)
            .populate('ownerId', 'name email phone avatar storeDetails');

        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching shop",
            error: error.message
        });
    }
};


const updateShopOwner = async (req, res) => {
    try {

        const userId = req.session.userId
        const role = req.session.role



        if (role != 'co-admin' && role != "admin") {
            return res.status(403).send("Forbidden: You do not have asses to addShop ")
        }

        const { id } = req.params;
        const updateData = req.body;

        const shop = await Shop.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('ownerId');

        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Also update user details if needed
        if (updateData.ownerName || updateData.contact) {
            await User.findByIdAndUpdate(shop.ownerId, {
                name: updateData.ownerName || shop.ownerName,
                email: updateData.contact?.email || shop.contact.email,
                phone: updateData.contact?.phone || shop.contact.phone
            });
        }

        res.status(200).json({
            message: "shop updated successfully",
            shop
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating shop",
            error: error.message
        });
    }
};

const deleteShopOwner = async (req, res) => {
    try {

        const userId = req.session.userId
        const role = req.session.role



        if (role != 'co-admin' && role != "admin") {
            return res.status(403).send("Forbidden: You do not have asses to addShop ")
        }

        const { id } = req.params;

        // Find the shop first
        const shop = await Shop.findById(id);
        if (!shop) {
            return res.status(404).json({ message: "shop not found" });
        }

        await User.findByIdAndDelete(shop.ownerId);


        // Now delete the shop
        await shop.findByIdAndDelete(id);

        res.status(200).json({ message: "shop deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
















const addContractor = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.session.userId;
        const role = req.session.role;

        if (role !== 'co-admin' && role !== "admin") {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).send("Forbidden: You do not have access to add contractor");
        }

        const { contractorName, contact, address, services, description, experience, pricing, password } = req.body;
        const phone = contact?.phone;
        const email = contact?.email;
        const city = address?.city;
        const state = address?.state;
        const pincode = address?.pincode;

        // Validation

        if (!contractorName || !phone || !email || !city || !state || !pincode || !password) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Missing required fields: contractorName, contact.phone, contact.email, password, address.city, address.state, address.pincode are required"
            });
        }

        // Check if contractor already exists
        const existingContractor = await Contractor.findOne({
            $or: [
                { contractorName },
                { 'contact.email': email },
                { 'contact.phone': phone }
            ]
        }).session(session);

        if (existingContractor) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                message: "Contractor with this name, email, or phone already exists"
            });
        }

        let user = await User.findOne({
            $or: [{ email: email }, { phone: phone }]
        }).session(session);

        let tempPasswordPlain = null;

        if (!user) {
            // Create new user
            tempPasswordPlain = password;
            const hashedPassword = await bcrypt.hash(tempPasswordPlain, 10);

            const newUserPayload = {
                name: contractorName,
                email: email,
                phone: phone,
                password: hashedPassword,
                role: 'contractor',
                address: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode
                },
                contractorDetails: {
                    specialization: services,
                    yearsOfExperience: experience?.years,
                    hourlyRate: pricing?.hourlyRate,
                    bio: description
                }
            };

            user = await User.create([newUserPayload], { session });
            // user = user[0];
        } else {
            // User exists - check if already a contractor
            if (user.role !== 'contractor') {
                user = await User.findByIdAndUpdate(user._id, {
                    $set: {
                        role: 'contractor',
                        email: email,
                        phone: phone,
                        address: {
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            pincode: address.pincode,
                            landmark: address.landmark
                        },
                        contractorDetails: {
                            specialization: services,
                            yearsOfExperience: experience?.years,
                            hourlyRate: pricing?.hourlyRate,
                            bio: description
                        }


                    }
                }, { new: true, runValidators: true });
                log('User updated to contractor via findByIdAndUpdate:', { id: user?._id, contractorDetails: user?.contractorDetails });
            }
        }

        // Create contractor record
        const newContractorPayload = {
            contractorName,
            contractorId: user._id,
            description,
            contact: {
                email,
                phone,
                alternatePhone: contact?.alternatePhone
            },
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                landmark: address.landmark
            },
            services,
            experience,
            pricing,
            createdBy: userId
        };

        const newContractor = await Contractor.create([newContractorPayload], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Contractor added successfully",
            // contractor: newContractor[0],
            newContractor,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error adding contractor:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Contractor with similar details already exists'
            });
        }

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all contractors
const getContractors = async (req, res) => {
    try {

        const { page = 1, limit = 10, service, city, search } = req.query;

        const filter = { isActive: true };

        if (service) filter.services = service;
        if (city) filter['address.city'] = new RegExp(city, 'i');
        if (search) {
            filter.$or = [
                { contractorName: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        const contractors = await Contractor.find(filter)
            // const contractors = await Contractor.find()

            .populate('contractorId', ' email phone avatar contractorDetails')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Contractor.countDocuments(filter);

        res.status(200).json({
            contractors,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching contractors",
            error: error.message
        });
    }
};

// Get contractor by ID
const getContractorById = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.params.id)
            .populate('contractorId', 'name email phone avatar contractorDetails')
            .populate('rating.reviews.userId', 'name avatar');

        if (!contractor) {
            return res.status(404).json({ message: "Contractor not found" });
        }

        res.status(200).json(contractor);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching contractor",
            error: error.message
        });
    }
};

// Update contractor
const updateContractor = async (req, res) => {
    try {

        const userId = req.session.userId
        const role = req.session.role



        if (role != 'co-admin' && role != "admin") {
            return res.status(403).send("Forbidden: You do not have asses to addShop ")
        }

        const { id } = req.params;
        const updateData = req.body;

        const contractor = await Contractor.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('contractorId');

        if (!contractor) {
            return res.status(404).json({ message: "Contractor not found" });
        }

        // Also update user details if needed
        if (updateData.contractorName || updateData.contact) {
            await User.findByIdAndUpdate(contractor.contractorId, {
                name: updateData.contractorName || contractor.contractorName,
                email: updateData.contact?.email || contractor.contact.email,
                phone: updateData.contact?.phone || contractor.contact.phone
            });
        }

        res.status(200).json({
            message: "Contractor updated successfully",
            contractor
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating contractor",
            error: error.message
        });
    }
};

const deleteContractor = async (req, res) => {
    try {

        const userId = req.session.userId
        const role = req.session.role



        if (role != 'co-admin' && role != "admin") {
            return res.status(403).send("Forbidden: You do not have asses to addShop ")
        }

        const { id } = req.params;

        // Find the contractor first
        const contractor = await Contractor.findById(id);
        if (!contractor) {
            return res.status(404).json({ message: "Contractor not found" });
        }

        await User.findByIdAndDelete(contractor.contractorId);


        // Now delete the contractor
        await Contractor.findByIdAndDelete(id);

        res.status(200).json({ message: "Contractor deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};








module.exports = {
    addShopOwner, getAllShopOwners, getShopOwnerById, updateShopOwner, deleteShopOwner,
    addContractor, getContractors, getContractorById, updateContractor, deleteContractor
}