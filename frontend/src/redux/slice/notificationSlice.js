// redux/slices/notificationSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../api/auth';

export const getNotifications = createAsyncThunk(
    'notifications/get',
    async ({ page = 1, unreadOnly = false }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({ page, unreadOnly });
            const response = await axiosClient.get(`/api/notifications?${params}`);
            console.log("data", response);

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/api/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put('/api/notifications/read-all');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null
    },
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.notifications = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n._id === action.payload.notification._id);
                if (notification) {
                    notification.isRead = true;
                }
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(notification => {
                    notification.isRead = true;
                });
                state.unreadCount = 0;
            });
    }
});

export const { addNotification, setUnreadCount, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;