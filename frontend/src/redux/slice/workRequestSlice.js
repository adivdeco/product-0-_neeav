// redux/slices/workRequestSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../api/auth';

// Async thunks
export const createWorkRequest = createAsyncThunk(
    'workRequests/create',
    async (requestData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/api/work-requests', requestData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getContractorRequests = createAsyncThunk(
    'workRequests/getContractorRequests',
    async ({ page = 1, status = '' }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({ page, ...(status && { status }) });
            const response = await axiosClient.get(`/api/work-requests/contractor-requests?${params}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const acceptWorkRequest = createAsyncThunk(
    'workRequests/accept',
    async (requestId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/api/work-requests/${requestId}/accept`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const rejectWorkRequest = createAsyncThunk(
    'workRequests/reject',
    async ({ requestId, reason }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/api/work-requests/${requestId}/reject`, { reason });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const workRequestSlice = createSlice({
    name: 'workRequests',
    initialState: {
        contractorRequests: [],
        loading: false,
        error: null,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            total: 0
        }
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        addRealTimeRequest: (state, action) => {
            state.contractorRequests.unshift(action.payload);
        },
        updateRequestStatus: (state, action) => {
            const { requestId, status } = action.payload;
            const request = state.contractorRequests.find(req => req._id === requestId);
            if (request) {
                request.status = status;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Work Request
            .addCase(createWorkRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createWorkRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(createWorkRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Contractor Requests
            .addCase(getContractorRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getContractorRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.contractorRequests = action.payload.requests;
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    totalPages: action.payload.totalPages,
                    total: action.payload.total
                };
            })
            .addCase(getContractorRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Accept/Reject
            .addCase(acceptWorkRequest.fulfilled, (state, action) => {
                const request = state.contractorRequests.find(req => req._id === action.payload.workRequest._id);
                if (request) {
                    request.status = 'accepted';
                }
            })
            .addCase(rejectWorkRequest.fulfilled, (state, action) => {
                const request = state.contractorRequests.find(req => req._id === action.payload.workRequest._id);
                if (request) {
                    request.status = 'rejected';
                    request.rejectionReason = action.payload.workRequest.rejectionReason;
                }
            });
    }
});

export const { clearError, addRealTimeRequest, updateRequestStatus } = workRequestSlice.actions;
export default workRequestSlice.reducer;