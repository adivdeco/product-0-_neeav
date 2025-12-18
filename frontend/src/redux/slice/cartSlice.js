import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/auth';

export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/cart/crt_dta');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/cart/add', { productId, quantity });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
        }
    }
);

export const updateCartItemQuantity = createAsyncThunk(
    'cart/updateCartItemQuantity',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/auth/cart/update/${productId}`, { quantity });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update quantity');
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.delete(`/auth/cart/remove/${productId}`);
            return { productId, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.delete('/auth/cart/clear');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
        }
    }
);

export const checkout = createAsyncThunk(
    'cart/checkout',
    async (checkoutData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/orders/checkout', checkoutData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Checkout failed');
        }
    }
);

// export const checkout = createAsyncThunk(
//     'cart/checkout',
//     async (checkoutData, { rejectWithValue }) => {
//         try {
//             // Updated to match your BuyRequestRouter endpoint
//             const response = await axiosClient.post('/buy-requests', {
//                 productId: checkoutData.productId,
//                 quantity: checkoutData.quantity,
//                 message: checkoutData.message,
//                 shippingAddress: checkoutData.shippingAddress,
//                 paymentMethod: checkoutData.paymentMethod || 'cash_on_delivery',
//                 saveAddress: checkoutData.saveAddress
//             });
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data?.message || 'Checkout failed');
//         }
//     }
// );

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        total: 0,
        totalItems: 0,
        loading: false,
        error: null,
        checkoutLoading: false
    },
    reducers: {
        clearCartState: (state) => {
            state.items = [];
            state.total = 0;
            state.totalItems = 0;
            state.error = null;
        },
        updateCartCount: (state, action) => {
            state.totalItems = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.cart || [];
                state.total = action.payload.total || 0;
                state.totalItems = action.payload.totalItems || 0;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add to Cart
            .addCase(addToCart.fulfilled, (state, action) => {
                state.totalItems = action.payload.cartCount;
            })

            // Update Cart Item Quantity
            .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
                const { productId, quantity, price, subtotal } = action.payload.cartItem;
                const itemIndex = state.items.findIndex(item => item.productId === productId);

                if (itemIndex !== -1) {
                    state.items[itemIndex].quantity = quantity;
                    state.items[itemIndex].subtotal = subtotal;

                    // Recalculate total
                    state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
                }
            })

            // Remove from Cart
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.productId !== action.payload.productId);
                state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
            })

            // Clear Cart
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
                state.total = 0;
                state.totalItems = 0;
            })

            // Checkout
            .addCase(checkout.pending, (state) => {
                state.checkoutLoading = true;
            })
            .addCase(checkout.fulfilled, (state) => {
                state.checkoutLoading = false;
                // Cart will be cleared after successful checkout
            })
            .addCase(checkout.rejected, (state, action) => {
                state.checkoutLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearCartState, updateCartCount } = cartSlice.actions;
export default cartSlice.reducer;