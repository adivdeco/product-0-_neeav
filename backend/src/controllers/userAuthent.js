const User = require('../models/userSchema')
const bcrypt = require('bcrypt');
const validateuser = require('../utils/validators');
const Contractor = require('../models/contractorSchema');
const Shop = require('../models/shopSchema');
// const jwt = require('jsonwebtoken');
// const redisClient = require('../config/redis');



const registerUser = async (req, res) => {
    try {

        validateuser(req.body);

        const { password, email } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'User'


        const check = await User.findOne({ email })

        if (check) {
            return res.status(400).json({
                message: "Email is alredy registered , try with different email_Id"
            });
        } else {

            const user = await User.create(req.body);

            // Create session after registration
            req.session.userId = user._id;
            req.session.email = user.email;

            const reply = {
                name: user.name,
                email: user.email,
                _id: user._id,
                role: user.role,
            }

            res.status(200).json({
                user: reply,
                message: "login sussesfully",
            });

        }




    } catch (error) {
        console.error('Error in reg New User:', error);
        res.sendStatus(500).json({ message: 'Internal server error' });

    }
}


const loginUser = async (req, res) => {
    // console.log("Login attempt received");

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required",
                field: !email ? "email" : "password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log("No user found with email:", email);
            return res.status(401).json({
                success: false,
                error: "No account found with this email",
                field: "email"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log("Password comparison failed");
            return res.status(401).json({
                success: false,
                error: "Incorrect password",
                field: "password"
            });
        }

        // Create session
        req.session.userId = user._id;
        req.session.email = user.email;
        req.session.role = user.role;

        console.log('=== SESSION CREATED ===');
        console.log('Session ID:', req.sessionID);
        console.log('Session Data:', req.session);
        console.log('=======================');

        const reply = {
            name: user.name,
            email: user.email,
            _id: user._id,
            role: user.role,
            createdAt: user.createdAt,
            avatar: user.avatar || '',
        }

        // console.log("Login successful for user:", email);
        res.status(200).json({
            success: true,
            user: reply,
            message: "Login successful"
        });

    } catch (error) {
        console.error('Error in login:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: "An unexpected error occurred during login",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

const logOutUser = async (req, res) => {
    try {
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: "Could not logout"
                });
            }

            // Clear the session cookie
            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });

            res.status(200).json({
                success: true,
                message: "Logout successful"
            });
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Error: " + err.message
        });
    }
}




const allUsers = async (req, res) => {

    try {
        // const userId = req.session.userId;
        const role = req.session.role;

        if (role !== 'co-admin' && role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: You do not have access to add bills"
            });
        }


        const users = await User.find();
        res.status(200).json({
            message: "Users retrieved successfully",
            users
        });

    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
}

const updateUser = async (req, res) => {

    try {
        const role = req.session.role;

        if (role !== 'co-admin' && role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: You do not have access to update users"
            });
        }


        const { id } = req.params;
        const updateData = req.body;


        if (Object.prototype.hasOwnProperty.call(updateData, 'role')) {
            if (req.session.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: only admin can change user roles' });
            }
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating user",
            error: error.message
        });
    }

}



const deleteUser = async (req, res) => {
    try {
        const userId = req.session.userId;
        const role = req.session.role;

        if (role != 'co-admin' && role != "admin") {
            return res.status(403).send("Forbidden: You do not have access to delete users");
        }

        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === 'contractor') {
            const contractor = await Contractor.findOne({ contractorId: id });
            if (contractor) {
                await Contractor.findByIdAndDelete(contractor._id);
            }
        } else if (user.role === 'store_owner') {
            const shop = await Shop.findOne({ ownerId: id });
            if (shop) {
                await Shop.findByIdAndDelete(shop._id);
            }
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            message: "User deleted successfully",
            deletedUser: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            message: "Error deleting user",
            error: error.message
        });
    }
};

// const updateData = async (req, res) => {
//     try {
//         const userId = req.session.userId;
//         const role = req.session.role;
//         const updateData = req.body;

//         // Update User
//         const user = await User.findByIdAndUpdate(
//             userId, 
//             updateData, 
//             { new: true, runValidators: true }
//         ).select('-password');

//         let additionalUpdate = null;

//         // Update role-specific data
//         if (role === 'contractor') {
//             additionalUpdate = await Contractor.findOneAndUpdate(
//                 { contractorId: userId }, 
//                 updateData,
//                 { new: true, runValidators: true }
//             );
//         } else if (role === 'store_owner') {
//             additionalUpdate = await Shop.findOneAndUpdate(
//                 { ownerId: userId }, 
//                 updateData,
//                 { new: true, runValidators: true }
//             );
//         }

//         res.status(200).json({
//             message: "User updated successfully",
//             user,
//             [role === 'contractor' ? 'contractor' : 'shop']: additionalUpdate
//         });

//     } catch (error) {
//         console.error('Error in updating user:', error);
//         res.status(500).json({
//             message: "Error in updating user",
//             error: error.message
//         });
//     }
// };

// Update user profile only

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        const updateData = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            message: "Error updating profile",
            error: error.message
        });
    }
};

const updateContractorServices = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { services, description, experience, pricing } = req.body;

        // Validate that user is a contractor
        const user = await User.findById(userId);
        if (user.role !== 'contractor') {
            return res.status(403).json({
                message: "Access denied. User is not a contractor"
            });
        }

        const contractor = await Contractor.findOneAndUpdate(
            { contractorId: userId },
            {
                services,
                description,
                experience,
                pricing,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!contractor) {
            return res.status(404).json({
                message: "Contractor profile not found"
            });
        }

        res.status(200).json({
            message: "Contractor services updated successfully",
            contractor
        });

    } catch (error) {
        console.error('Error updating contractor services:', error);
        res.status(500).json({
            message: "Error updating contractor services",
            error: error.message
        });
    }
};

// const updateShopData = async (req, res) => {
//     try {
//         const userId = req.session.userId;
//         const { categories, businessHours, description, address, avatar, images } = req.body;

//         // Validate that user is a store owner
//         const user = await User.findById(userId);
//         if (user.role !== 'store_owner') {
//             return res.status(403).json({
//                 message: "Access denied. User is not a store owner"
//             });
//         }

//         const shop = await Shop.findOneAndUpdate(
//             { ownerId: userId },
//             {
//                 categories,
//                 businessHours,
//                 description,
//                 address,
//                 updatedAt: new Date(),
//                 avatar,
//                 images
//             },
//             { new: true, runValidators: true }
//         );

//         if (!shop) {
//             return res.status(404).json({
//                 message: "Shop profile not found"
//             });
//         }

//         res.status(200).json({
//             message: "Shop data updated successfully",
//             shop
//         });

//     } catch (error) {
//         console.error('Error updating shop data:', error);
//         res.status(500).json({
//             message: "Error updating shop data",
//             error: error.message
//         });
//     }
// };

const updateShopData = async (req, res) => {
    try {
        const userId = req.session.userId;
        const {
            shopName,
            ownerName,
            description,
            contact,
            address,
            categories,
            businessHours,
            avatar,
            images
        } = req.body;

        // Validate that user is a store owner
        const user = await User.findById(userId);
        if (user.role !== 'store_owner') {
            return res.status(403).json({
                message: "Access denied. User is not a store owner"
            });
        }

        const updateFields = {
            ...(shopName && { shopName }),
            ...(ownerName && { ownerName }),
            ...(description && { description }),
            ...(contact && { contact }),
            ...(address && { address }),
            ...(categories && { categories }),
            ...(businessHours && { businessHours }),
            ...(avatar && { avatar }),
            ...(images && { images }),
            updatedAt: new Date()
        };

        const shop = await Shop.findOneAndUpdate(
            { ownerId: userId },
            updateFields,
            { new: true, runValidators: true }
        );

        if (!shop) {
            return res.status(404).json({
                message: "Shop profile not found"
            });
        }

        res.status(200).json({
            message: "Shop data updated successfully",
            shop
        });

    } catch (error) {
        console.error('Error updating shop data:', error);
        res.status(500).json({
            message: "Error updating shop data",
            error: error.message
        });
    }
};
const getShopProfile = async (req, res) => {
    try {
        const userId = req.session.userId;

        // Validate that user is a store owner
        const user = await User.findById(userId);
        if (user.role !== 'store_owner') {
            return res.status(403).json({
                message: "Access denied. User is not a store owner"
            });
        }

        const shop = await Shop.findOne({ ownerId: userId });

        if (!shop) {
            return res.status(404).json({
                message: "Shop profile not found"
            });
        }

        res.status(200).json({
            message: "Shop profile retrieved successfully",
            shop
        });

    } catch (error) {
        console.error('Error fetching shop profile:', error);
        res.status(500).json({
            message: "Error fetching shop profile",
            error: error.message
        });
    }
};

module.exports = { registerUser, updateContractorServices, updateShopData, updateUserProfile, loginUser, logOutUser, allUsers, updateUser, deleteUser, getShopProfile }