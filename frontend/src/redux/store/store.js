import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../authSlice';
import workRequestReducer from '../slice/workRequestSlice';
import notificationReducer from '../slice/notificationSlice';
import buyRequestReducer from '../slice/buyRequestSlice';
import userBuyRequestReducer from '../slice/userBuyRequestSlice';
import cartReducer from '../slice/cartSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workRequests: workRequestReducer,
        notifications: notificationReducer,
        buyRequests: buyRequestReducer,
        userBuyRequests: userBuyRequestReducer,
        cart: cartReducer,

    },
});
