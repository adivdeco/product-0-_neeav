import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/auth';

// Async thunks
export const getShopOwnerRequests = createAsyncThunk(
    'buyRequests/getShopOwnerRequests',
    async ({ page = 1, status = '', limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/buy-requests/shop-owner/requests', {
                params: { page, status, limit }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
        }
    }
);

export const acceptBuyRequest = createAsyncThunk(
    'buyRequests/acceptBuyRequest',
    async ({ requestId, expectedDelivery }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/buy-requests/${requestId}/accept`, {
                expectedDelivery
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to accept request');
        }
    }
);

export const rejectBuyRequest = createAsyncThunk(
    'buyRequests/rejectBuyRequest',
    async ({ requestId, reason }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/buy-requests/${requestId}/reject`, {
                reason
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject request');
        }
    }
);

export const shipBuyRequest = createAsyncThunk( // NEW
    'buyRequests/shipBuyRequest',
    async (requestId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/buy-requests/${requestId}/ship`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark as shipped');
        }
    }
);

export const completeBuyRequest = createAsyncThunk( // RENAMED from markAsCompleted
    'buyRequests/completeBuyRequest',
    async (requestId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/buy-requests/${requestId}/complete`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark as completed');
        }
    }
);

const buyRequestSlice = createSlice({
    name: 'buyRequests',
    initialState: {
        shopOwnerRequests: [],
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
        addRealTimeRequest: (state, action) => {
            state.shopOwnerRequests.unshift(action.payload);
        },
        updateRequestStatus: (state, action) => {
            const { requestId, status } = action.payload;
            const request = state.shopOwnerRequests.find(req => req._id === requestId);
            if (request) {
                request.status = status;
            }
        },
        // ✅ NEW: Handle buy request cancelled
        buyRequestCancelled: (state, action) => {
            const { requestId } = action.payload;
            const request = state.shopOwnerRequests.find(req => req._id === requestId);
            if (request) {
                request.status = 'cancelled';
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Shop Owner Requests
            .addCase(getShopOwnerRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getShopOwnerRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.shopOwnerRequests = action.payload.requests;
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    totalPages: action.payload.totalPages,
                    total: action.payload.total,
                    limit: action.payload.limit || 10
                };
            })
            .addCase(getShopOwnerRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Accept Buy Request
            .addCase(acceptBuyRequest.fulfilled, (state, action) => {
                const request = state.shopOwnerRequests.find(req => req._id === action.payload.buyRequest._id);
                if (request) {
                    request.status = 'accepted';
                    request.expectedDelivery = action.payload.buyRequest.expectedDelivery;
                }
            })
            // Reject Buy Request
            .addCase(rejectBuyRequest.fulfilled, (state, action) => {
                const request = state.shopOwnerRequests.find(req => req._id === action.payload.buyRequest._id);
                if (request) {
                    request.status = 'rejected';
                    request.rejectionReason = action.payload.buyRequest.rejectionReason;
                }
            })
            // Ship Buy Request
            .addCase(shipBuyRequest.fulfilled, (state, action) => {
                const request = state.shopOwnerRequests.find(req => req._id === action.payload.buyRequest._id);
                if (request) {
                    request.status = 'shipped';
                }
            })
            // Complete Buy Request
            .addCase(completeBuyRequest.fulfilled, (state, action) => {
                const request = state.shopOwnerRequests.find(req => req._id === action.payload.buyRequest._id);
                if (request) {
                    request.status = 'completed';
                    request.actualDelivery = action.payload.buyRequest.actualDelivery;
                }
            });
    }
});

export const { clearError, addRealTimeRequest, updateRequestStatus, buyRequestCancelled } = buyRequestSlice.actions;
export default buyRequestSlice.reducer;