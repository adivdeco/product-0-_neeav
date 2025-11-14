const express = require('express');
// const User = require('../models/userSchema.js')
const { registerUser, loginUser, logOutUser, allUsers, updateUser, deleteUser, updateContractorServices, updateShopData, updateUserProfile, getShopProfile, getContractorProfile } = require('../controllers/userAuthent.js');
const User = require('../models/userSchema.js');

const authRouter = express.Router();


authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/logout', logOutUser)

authRouter.get('/all_users', allUsers)
authRouter.put('/update_user/:id', updateUser)
authRouter.delete('/delete_user/:id', deleteUser)

// User routes
authRouter.put('/profile', updateUserProfile);  // done

authRouter.get('/Shop_profile', getShopProfile);  // done
authRouter.put('/shop/data', updateShopData);   // done

authRouter.get('/Contractor_Profile', getContractorProfile). // done
    authRouter.put('/contractor/services', updateContractorServices);  // done


authRouter.get('/check-session', async (req, res) => {
    if (req.session && req.session.userId) {
        const user = await User.findById(req.session.userId).select("-password");
        return res.json({ success: true, isLoggedIn: true, user });
    } else {
        return res.json({ success: true, isLoggedIn: false });
    }
});


module.exports = authRouter;
