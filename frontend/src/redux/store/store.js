import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../authSlice';
import workRequestReducer from '../slice/workRequestSlice';
import notificationReducer from '../slice/notificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workRequests: workRequestReducer,
        notifications: notificationReducer,
    },
});
