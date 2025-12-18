import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axiosClient from '../../api/auth';



const selectProductsState = (state) => state.products;


export const selectTopRatedProducts = createSelector(
    [selectProductsState],
    (products) => {
        const shouldFetch = !products.cacheTimestamp ||
            (Date.now() - products.cacheTimestamp) > products.cacheDuration;

        return {
            products: products.topRated,
            loading: products.loading,
            error: products.error,
            shouldFetch,
            // Add cacheTimestamp to make it easier to compare
            cacheTimestamp: products.cacheTimestamp
        };
    }
);

// Async thunk to fetch top rated products
export const fetchTopRatedProducts = createAsyncThunk(
    'products/fetchTopRated',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/products/public/products', {
                params: {
                    // limit: 8,
                    sortBy: 'rating',
                    sortOrder: 'desc'
                }
            });
            return response.data.products;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
        }
    }
);

// Async thunk to fetch all products with caching
// export const fetchProducts = createAsyncThunk(
//     'products/fetchProducts',
//     async ({
//         page = 1,
//         limit = 20,
//         search = '',
//         category = '',
//         brand = '',
//         minPrice = '',
//         maxPrice = '',
//         sortBy = 'createdAt',
//         sortOrder = 'desc'
//     }, { rejectWithValue }) => {
//         try {
//             const params = {
//                 page,
//                 limit,
//                 search,
//                 category,
//                 brand,
//                 minPrice,
//                 maxPrice,
//                 sortBy,
//                 sortOrder
//             };

//             const response = await axiosClient.get('/products/public/products', { params });
//             return {
//                 products: response.data.products,
//                 pagination: response.data.pagination,
//                 filters: response.data.filters
//             };
//         } catch (error) {
//             return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
//         }
//     }
// );
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params, { getState, rejectWithValue }) => {
        const state = getState().products;

        // Prevent fetching if same params and cache is valid
        if (selectIsCacheValid(getState(), params)) {
            return rejectWithValue('ALREADY_CACHED');
        }

        try {
            const response = await axiosClient.get('/products/public/products', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState: {
        topRated: [],
        allProducts: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalProducts: 0
        },
        availableFilters: {
            categories: [],
            brands: [],
            priceRange: { min: 0, max: 100000 }
        },
        loading: false,
        error: null,
        cacheTimestamp: null,
        cacheDuration: 5 * 60 * 1000, // 5 minutes cache
        lastFetchParams: null
    },
    reducers: {
        clearProductsCache: (state) => {
            state.topRated = [];
            state.allProducts = [];
            state.cacheTimestamp = null;
            state.lastFetchParams = null;
        },
        updateFilters: (state, action) => {
            state.availableFilters = { ...state.availableFilters, ...action.payload };
        },
        setCurrentPage: (state, action) => {
            state.pagination.currentPage = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Top Rated Products
            .addCase(fetchTopRatedProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopRatedProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.topRated = action.payload;
                state.cacheTimestamp = Date.now();
            })
            .addCase(fetchTopRatedProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // All Products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.allProducts = action.payload.products;
                state.pagination = action.payload.pagination;
                state.availableFilters = action.payload.filters || state.availableFilters;
                state.cacheTimestamp = Date.now();
                state.lastFetchParams = action.meta.arg;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

// Selector to check if cache is valid
export const selectIsCacheValid = (state, params) => {
    const { products } = state;
    if (!products.cacheTimestamp) return false;

    const timeElapsed = Date.now() - products.cacheTimestamp;
    const isSameParams = JSON.stringify(params) === JSON.stringify(products.lastFetchParams);

    return isSameParams && timeElapsed < products.cacheDuration;
};

// Add another memoized selector for just the products
export const selectTopRatedProductsArray = createSelector(
    [selectProductsState],
    (products) => products.topRated
);

// Basic selectors
export const selectProducts = (state) => state.products;
export const selectTopRated = (state) => state.products.topRated;
export const selectLoading = (state) => state.products.loading;
export const selectError = (state) => state.products.error;
export const selectCacheTimestamp = (state) => state.products.cacheTimestamp;

export const selectShouldFetchTopRated = createSelector(
    [selectCacheTimestamp],
    (cacheTimestamp) => {
        return !cacheTimestamp || (Date.now() - cacheTimestamp) > (5 * 60 * 1000);
    }
);

export const { clearProductsCache, updateFilters, setCurrentPage } = productSlice.actions;
export default productSlice.reducer;