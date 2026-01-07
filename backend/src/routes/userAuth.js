const express = require('express');
// const User = require('../models/userSchema.js')
const { registerUser, loginUser, socialLogin, logOutUser, allUsers, updateUser, deleteUser, updateContractorServices, updateShopData, updateUserProfile, getShopProfile, getContractorProfile } = require('../controllers/userAuthent.js');
const User = require('../models/userSchema.js');
const Product = require('../models/productSchema')
const authMiddleware = require('../middleware/authMiddleware.js')
const adminMiddleware = require('../middleware/adminMiddleware.js')

const authRouter = express.Router();


authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/social-login', socialLogin)
authRouter.post('/logout', authMiddleware, logOutUser)

authRouter.get('/all_users', adminMiddleware, allUsers)
authRouter.put('/update_user/:id', adminMiddleware, updateUser)
authRouter.delete('/delete_user/:id', adminMiddleware, deleteUser)

// User routes
authRouter.put('/profile', authMiddleware, updateUserProfile);  // done

authRouter.get('/Shop_profile', authMiddleware, getShopProfile);  // done
authRouter.put('/shop/data', authMiddleware, updateShopData);   // done

authRouter.get('/Contractor_Profile', authMiddleware, getContractorProfile); // done
authRouter.put('/contractor/services', authMiddleware, updateContractorServices);  // done


authRouter.get('/check-session', authMiddleware, async (req, res) => {

    // const sessionID = req.sessionID
    // if (req.sessionID && req.session.userId) {
    //     const user = await User.findById(req.session.userId).select("-password");
    //     return res.json({ success: true, isLoggedIn: true, user, sessionID });
    // } else {
    //     return res.json({ success: true, isLoggedIn: false, message: "no cokkies saved" });
    // }
    //     const reply = {
    //         name: req.finduser.name,
    //         email: req.finduser.email,
    //         _id: req.finduser._id,
    //         role: req.finduser.role,
    //     };

    //     console.log(reply);


    //     res.status(200).json({
    //         message: "valid user",
    //         user: reply
    //     })
    // });
    const _id = req.finduser._id
    const user = req.finduser
    const token = req.cookies.token;


    if (!_id) {
        return res.json({ message: "loginFailed" })
    } else {
        // const user = await User.findById(_id).select(-"password")
        res.status(200).json({
            message: "valid user",
            user,
            token

        })
    }

});



module.exports = authRouter;
