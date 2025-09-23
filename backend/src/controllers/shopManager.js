const Shop = require("../models/shopSchema")
const mongoose = require('mongoose')
const User = require("../models/userSchema")
const bcrypt = require('bcrypt');



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
                "address.street": address.street,
                'address.city': address.city,
                'address.state': address.state,
                'address.pincode': address.pincode,
                'storeDetails.storeName': shopName,
                'storeDetails.productCategories': categories,
                // avatar: image[0].url

            };

            ownerUser = await User.create(newUserPayload)

        } else {
            // user exists: if their role isn't store_owner, optionally promote them
            if (ownerUser.role !== 'store_owner') {
                ownerUser.role = 'store_owner';
                // do not change password here
                await ownerUser.save({ session });
            }
        }

        // Create shop with ownerId reference
        const newShopPayload = {
            ...req.body,
            createdBy: userId,       // who created the shop (admin)
            ownerId: ownerUser._id
        };

        const newShop = await Shop.create(newShopPayload)



        // const newShop = await Shop.create({
        //     ...req.body,
        //     userId: userId // Track who created the shop
        // });

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

        res.sendStatus(500).json({ message: 'Internal server error' });
    };

}





module.exports = { addShopOwner }