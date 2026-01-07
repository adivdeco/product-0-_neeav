import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../api/auth'
// import axios from 'axios';



export const registerUser = createAsyncThunk(
    'auth/register',  // This is the Redux action type prefix used internally by createAsyncThunk.
    async (userData, { rejectWithValue }) => {      //in userData we pass value which we get after responce on login,signup etc..
        try {
            const response = await axiosClient.post('/auth/register', userData, { withCredentials: true });  // later one we pass to backend at it addres
            return response.data.user; // bcz in backend we send like res.send({user:reply,message:"njknv"}) so it call data.user
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);






export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await axiosClient.post('/auth/login', credentials, { withCredentials: true });
            // const res = await axios.post(
            //     "https://product-0-neeav-1.onrender.com/auth/login",
            //     credentials,
            //     { withCredentials: true }
            // );

            // return res.data.user;


            return data.user;
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                return rejectWithValue({
                    message: error.response.data.error || 'Login failed',
                    field: error.response.data.field || null,
                    details: error.response.data.details || null
                });
            } else if (error.request) {
                // The request was made but no response was received
                return rejectWithValue({
                    message: 'No response from server',
                    details: 'Network error or server is down'
                });
            } else {
                // Something happened in setting up the request
                return rejectWithValue({
                    message: 'Request setup error',
                    details: error.message
                });
            }
        }
    }
);



export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/auth/check-session');

            return {
                user: response.data.user,
                token: response.data.token,
                isAuthenticated: true
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Authentication failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutThunk',
    async (_, { rejectWithValue }) => {
        try {
            await axiosClient.post('/auth/logout');
            return null;
        } catch (error) {
            console.log('Error in login:', error);

            return rejectWithValue(error);


        }
    }
);


export const socialLogin = createAsyncThunk(
    'auth/socialLogin',
    async (socialData, { rejectWithValue }) => {
        try {
            const { data } = await axiosClient.post('/auth/social-login', socialData);
            return data.user;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || 'Social login failed',
                details: error.message
            });
        }
    }
);


//hear we implement logic if user visit again after login ,

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        token: null,

    },
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Register User Cases
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
            })
            //  login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
            })

            // Social Login Cases
            .addCase(socialLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(socialLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(socialLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Social login failed';
                state.isAuthenticated = false;
                state.user = null;
            })

            // Check Auth Cases
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = action.payload;
            })

            // Logout User Cases
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
            });
    }
});

export const { loginSuccess, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
