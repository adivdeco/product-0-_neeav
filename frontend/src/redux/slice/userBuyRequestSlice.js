// redux/slice/userBuyRequestSlice.js - FIXED
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/auth';

// Async thunks
export const getUserBuyRequests = createAsyncThunk(
    'userBuyRequests/getUserBuyRequests',
    async ({ page = 1, status = '', limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/buy-requests/my-requests', {
                params: { page, status, limit }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your purchase requests');
        }
    }
);

export const cancelBuyRequest = createAsyncThunk(
    'userBuyRequests/cancelBuyRequest',
    async ({ requestId, reason }, { rejectWithValue }) => {
        try {
            // Add validation to check if requestId is valid
            if (!requestId || requestId === 'undefined') {
                throw new Error('Invalid request ID');
            }

            const response = await axiosClient.put(`/buy-requests/${requestId}/cancel`, { reason });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel request');
        }
    }
);

export const markBuyRequestReceived = createAsyncThunk(
    'userBuyRequests/markBuyRequestReceived',
    async (requestId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/buy-requests/${requestId}/received`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark as received');
        }
    }
);

const userBuyRequestSlice = createSlice({
    name: 'userBuyRequests',
    initialState: {
        userBuyRequests: [],
        loading: false,
        error: null,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            total: 0,
            limit: 10
        }
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateBuyRequestStatus: (state, action) => {
            const { requestId, status, actualDelivery } = action.payload;
            const request = state.userBuyRequests.find(req => req._id === requestId);
            if (request) {
                request.status = status;
                if (actualDelivery) request.actualDelivery = actualDelivery;
            }
        },
        // ✅ NEW: Handle order shipped event
        orderShipped: (state, action) => {
            const { requestId } = action.payload;
            const request = state.userBuyRequests.find(req => req._id === requestId);
            if (request) {
                request.status = 'shipped';
            }
        },
        // ✅ NEW: Handle order delivered event
        orderDelivered: (state, action) => {
            const { requestId, actualDelivery } = action.payload;
            const request = state.userBuyRequests.find(req => req._id === requestId);
            if (request) {
                request.status = 'completed';
                if (actualDelivery) request.actualDelivery = actualDelivery;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Get User Buy Requests
            .addCase(getUserBuyRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserBuyRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.userBuyRequests = action.payload.requests;
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    totalPages: action.payload.totalPages,
                    total: action.payload.total,
                    limit: action.payload.limit || 10
                };
            })
            .addCase(getUserBuyRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Cancel Buy Request
            .addCase(cancelBuyRequest.fulfilled, (state, action) => {
                const request = state.userBuyRequests.find(req => req._id === action.payload.buyRequest._id);
                if (request) {
                    request.status = 'cancelled';
                    request.cancellationReason = action.payload.buyRequest.cancellationReason;
                }
            })
            // Mark as Received
            .addCase(markBuyRequestReceived.fulfilled, (state, action) => {
                const request = state.userBuyRequests.find(req => req._id === action.payload.buyRequest._id);
                if (request) {
                    request.status = 'completed';
                    request.actualDelivery = action.payload.buyRequest.actualDelivery;
                }
            });
    }
});

export const { clearError, updateBuyRequestStatus, orderShipped, orderDelivered } = userBuyRequestSlice.actions;
export default userBuyRequestSlice.reducer;