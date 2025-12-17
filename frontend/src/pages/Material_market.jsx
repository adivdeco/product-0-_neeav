// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router';
// import axiosClient from '../api/auth';
// import toast, { Toaster } from 'react-hot-toast';
// import Navbar from '../components/home/navbar';
// import BottomPart from '../components/home/BottomPart';

// const ProductListing = () => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [filters, setFilters] = useState({
//         search: '',
//         category: '',
//         minPrice: '',
//         maxPrice: '',
//         brand: '',
//         inStock: true
//     });
//     const [sortBy, setSortBy] = useState('createdAt');
//     const [sortOrder, setSortOrder] = useState('desc');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [showFilters, setShowFilters] = useState(false);
//     const [availableFilters, setAvailableFilters] = useState({
//         categories: [],
//         brands: [],
//         priceRange: { min: 0, max: 100000 }
//     });

//     const sortOptions = [
//         { value: 'createdAt_desc', label: 'Newest First' },
//         { value: 'createdAt_asc', label: 'Oldest First' },
//         { value: 'price_asc', label: 'Price: Low to High' },
//         { value: 'price_desc', label: 'Price: High to Low' },
//         { value: 'name_asc', label: 'Name: A to Z' },
//         { value: 'name_desc', label: 'Name: Z to A' },
//         { value: 'stock_desc', label: 'Most in Stock' }
//     ];

//     useEffect(() => {
//         fetchProducts();
//         fetchAvailableFilters();
//     }, [filters, sortBy, sortOrder, currentPage]);

//     const fetchProducts = async () => {
//         try {
//             setLoading(true);
//             const params = {
//                 page: currentPage,
//                 limit: 20,
//                 ...filters,
//                 sortBy,
//                 sortOrder
//             };

//             const response = await axiosClient.get('/products/public/products', { params });
//             setProducts(response.data.products);
//             setTotalPages(response.data.pagination.totalPages);
//         } catch (error) {
//             console.error('Error fetching products:', error);
//             toast.error('Failed to load products');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchAvailableFilters = async () => {
//         try {
//             const response = await axiosClient.get('/products/public/products?limit=1');
//             setAvailableFilters(response.data.filters);
//         } catch (error) {
//             console.error('Error fetching filters:', error);
//         }
//     };

//     const handleFilterChange = (key, value) => {
//         setFilters(prev => ({
//             ...prev,
//             [key]: value
//         }));
//         setCurrentPage(1);
//     };

//     const handleSortChange = (value) => {
//         const [sortField, order] = value.split('_');
//         setSortBy(sortField);
//         setSortOrder(order);
//         setCurrentPage(1);
//     };

//     const clearFilters = () => {
//         setFilters({
//             search: '',
//             category: '',
//             minPrice: '',
//             maxPrice: '',
//             brand: '',
//             inStock: true
//         });
//         setCurrentPage(1);
//     };

//     const addToCart = (product) => {
//         // Implement add to cart functionality
//         toast.success(`${product.name} added to cart!`);
//     };

//     // const buyNow = async (product) => {
//     //     try {
//     //         const response = await axiosClient.post('/buy-requests', {
//     //             productId: product._id,
//     //             quantity: 1, // Default to 1 in listing
//     //             message: `I want to buy ${product.name}`,
//     //             paymentMethod: 'cash_on_delivery'
//     //         });

//     //         toast.success('Buy request sent to seller!');
//     //     } catch (error) {
//     //         console.error('Error sending buy request:', error);
//     //         toast.error(error.response?.data?.message || 'Failed to send buy request');
//     //     }
//     // };

//     const getStockStatusColor = (stock, minStockLevel) => {
//         if (stock === 0) return 'text-red-600 bg-red-50';
//         if (stock <= minStockLevel) return 'text-yellow-600 bg-yellow-50';
//         return 'text-green-600 bg-green-50';
//     };

//     return (
//         <div>
//             <div className="min-h-screen bg-gray-50">
//                 <Toaster position="bottom-center" />
//                 <Navbar />

//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//                     {/* Header */}
//                     <div className="mb-6">
//                         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Building Materials</h1>
//                         <p className="text-gray-600 mt-2">Find quality construction materials from trusted suppliers</p>
//                     </div>

//                     {/* Filters and Sort Bar */}
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
//                         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                             {/* Search */}
//                             <div className="flex-1">
//                                 <input
//                                     type="text"
//                                     placeholder="Search products..."
//                                     value={filters.search}
//                                     onChange={(e) => handleFilterChange('search', e.target.value)}
//                                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 />
//                             </div>

//                             {/* Sort */}
//                             <div className="flex items-center gap-4">
//                                 <select
//                                     value={`${sortBy}_${sortOrder}`}
//                                     onChange={(e) => handleSortChange(e.target.value)}
//                                     className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 >
//                                     {sortOptions.map(option => (
//                                         <option key={option.value} value={option.value}>
//                                             {option.label}
//                                         </option>
//                                     ))}
//                                 </select>

//                                 {/* Mobile Filter Toggle */}
//                                 <button
//                                     onClick={() => setShowFilters(!showFilters)}
//                                     className="lg:hidden p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
//                                 >
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
//                                     </svg>
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Filter Options */}
//                         <div className={`mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
//                             {/* Category Filter */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
//                                 <select
//                                     value={filters.category}
//                                     onChange={(e) => handleFilterChange('category', e.target.value)}
//                                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 >
//                                     <option value="">All Categories</option>
//                                     {availableFilters.categories.map(category => (
//                                         <option key={category} value={category}>{category}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Brand Filter */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
//                                 <select
//                                     value={filters.brand}
//                                     onChange={(e) => handleFilterChange('brand', e.target.value)}
//                                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 >
//                                     <option value="">All Brands</option>
//                                     {availableFilters.brands.map(brand => (
//                                         <option key={brand} value={brand}>{brand}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Price Range */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
//                                 <input
//                                     type="number"
//                                     placeholder="Min price"
//                                     value={filters.minPrice}
//                                     onChange={(e) => handleFilterChange('minPrice', e.target.value)}
//                                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
//                                 <input
//                                     type="number"
//                                     placeholder="Max price"
//                                     value={filters.maxPrice}
//                                     onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
//                                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 />
//                             </div>
//                         </div>

//                         {/* Active Filters and Clear */}
//                         <div className="mt-4 flex flex-wrap items-center gap-2">
//                             <button
//                                 onClick={clearFilters}
//                                 className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//                             >
//                                 Clear All
//                             </button>
//                             {(filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
//                                 <span className="text-sm text-gray-600">
//                                     Active filters applied
//                                 </span>
//                             )}
//                         </div>
//                     </div>

//                     {/* Products List */}
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                         {loading ? (
//                             <div className="flex justify-center items-center py-12">
//                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//                             </div>
//                         ) : products.length === 0 ? (
//                             <div className="text-center py-12">
//                                 <div className="text-gray-400 text-6xl mb-4">📦</div>
//                                 <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
//                                 <p className="text-gray-500">Try adjusting your search or filters</p>
//                             </div>
//                         ) : (
//                             <div className="divide-y divide-gray-200">
//                                 {products.map((product) => (
//                                     <div key={product._id} className="transition-all duration-200 hover:bg-gray-50">
//                                         <Link
//                                             to={`/product/${product._id}`}
//                                             className="hover:text-blue-600 transition-colors"
//                                         >
//                                             <div className="p-4 sm:p-6">
//                                                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                                                     {/* Product Info */}
//                                                     <div className="flex items-start space-x-4 flex-1 min-w-0">
//                                                         {/* Product Image */}
//                                                         <div className="flex-shrink-0">
//                                                             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden">
//                                                                 {product.ProductImage ? (
//                                                                     <img
//                                                                         src={product.ProductImage}
//                                                                         alt={product.name}
//                                                                         className="w-full h-full object-cover"
//                                                                     />
//                                                                 ) : (
//                                                                     <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
//                                                                         <span className="text-white font-semibold text-sm">
//                                                                             {product.name?.charAt(0).toUpperCase()}
//                                                                         </span>
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         </div>

//                                                         {/* Product Details */}

//                                                         <div className="flex-1 min-w-0">

//                                                             <h3 className="text-lg font-semibold text-gray-900 truncate">
//                                                                 {product.name}
//                                                             </h3>


//                                                             <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
//                                                                 {/* <span>By {product.shopName || 'Unknown Store'}</span> */}
//                                                                 {/* <span>•</span> */}
//                                                                 <span>{product.brand || 'No Brand'}</span>
//                                                                 <span>•</span>
//                                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.stock, product.minStockLevel)}`}>
//                                                                     {product.stockStatus}
//                                                                 </span>
//                                                             </div>

//                                                             <div className="mt-2 flex items-center gap-4 text-sm">
//                                                                 <span className="text-2xl font-bold text-green-600">
//                                                                     ₹{product.price}
//                                                                 </span>
//                                                                 {product.costPrice && (
//                                                                     <span className="text-gray-500 line-through">
//                                                                         ₹{product.costPrice}
//                                                                     </span>
//                                                                 )}
//                                                                 {/* {product.taxRate && (
//                                                             <span className="text-gray-500">
//                                                                 +{product.taxRate}% tax
//                                                             </span>
//                                                         )} */}
//                                                             </div>

//                                                             <div className="mt-2 text-sm text-gray-600">
//                                                                 <span>Category: {product.category}</span>
//                                                                 {product.size && (
//                                                                     <span className="ml-3">Size: {product.size}</span>
//                                                                 )}
//                                                                 {product.unit && (
//                                                                     <span className="ml-3">Unit: {product.unit}</span>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Action Buttons */}
//                                                     <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//                                                         <button
//                                                             onClick={() => addToCart(product)}
//                                                             disabled={product.stock === 0}
//                                                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
//                                                         >
//                                                             Add to Cart
//                                                         </button>
//                                                         <button
//                                                             // onClick={() => buyNow(product)}
//                                                             disabled={product.stock === 0}
//                                                             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
//                                                         >
//                                                             Buy Now
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </Link>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}

//                         {/* Pagination */}
//                         {totalPages > 1 && (
//                             <div className="px-6 py-4 border-t border-gray-200">
//                                 <div className="flex justify-center items-center space-x-4">
//                                     <button
//                                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                                         disabled={currentPage === 1}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         Previous
//                                     </button>

//                                     <span className="text-sm text-gray-700">
//                                         Page {currentPage} of {totalPages}
//                                     </span>

//                                     <button
//                                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                                         disabled={currentPage === totalPages}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         Next
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             <div className="fixed   bottom-0 w-full z-50">
//                 <BottomPart />
//             </div>

//         </div>
//     );
// };

// export default ProductListing;



import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import axiosClient from '../api/auth';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../components/home/navbar';
import BottomPart from '../components/home/BottomPart';
import {
    Filter, X, Search, ChevronDown, ShoppingCart,
    Star, ArrowRight, Heart
} from 'lucide-react';

const ProductListing = () => {
    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        brand: '',
        inStock: false // Changed default to false to show all, toggle to filter
    });

    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const [availableFilters, setAvailableFilters] = useState({
        categories: [],
        brands: []
    });

    const sortOptions = [
        { value: 'createdAt_desc', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'rating_desc', label: 'Popularity' }
    ];

    // Effects
    useEffect(() => {
        fetchProducts();
    }, [filters, sortBy, sortOrder, currentPage]);

    useEffect(() => {
        fetchAvailableFilters();
    }, []);

    // API Calls
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 12, // Standard grid size
                ...filters,
                sortBy,
                sortOrder
            };

            // Simulating API delay to show skeleton (remove in production)
            // await new Promise(resolve => setTimeout(resolve, 800));

            const response = await axiosClient.get('/products/public/products', { params });
            setProducts(response.data.products);
            setTotalPages(response.data.pagination.totalPages);
            setTotalProducts(response.data.pagination.totalItems || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableFilters = async () => {
        try {
            const response = await axiosClient.get('/products/public/products?limit=1');
            // Assuming your API returns available categories/brands in meta or separate endpoint
            // For now mapping from response if API structure supports it, else relying on hardcoded or previous logic
            if (response.data.filters) {
                setAvailableFilters(response.data.filters);
            }
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    // Handlers
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        const [field, order] = e.target.value.split('_');
        setSortBy(field);
        setSortOrder(order);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            brand: '',
            inStock: false
        });
        setCurrentPage(1);
    };

    const addToCart = (e, product) => {
        e.preventDefault(); // Prevent navigation to detail page
        toast.success(`${product.name} added to cart!`);
    };

    // Components
    const SkeletonCard = () => (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 rounded w-8" />
                </div>
            </div>
        </div>
    );

    const FilterSection = ({ mobile = false }) => (
        <div className={`space-y-6 ${mobile ? 'p-4' : ''}`}>
            {/* Header for Mobile */}
            {mobile && (
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Search (Sidebar version) */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Search</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search materials..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
            </div>

            {/* Category */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="radio"
                            name="category"
                            checked={filters.category === ''}
                            onChange={() => handleFilterChange('category', '')}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-blue-600">All Categories</span>
                    </label>
                    {availableFilters.categories.map(cat => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                checked={filters.category === cat}
                                onChange={() => handleFilterChange('category', cat)}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-blue-600">{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Brand */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Brands</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="radio"
                            name="brand"
                            checked={filters.brand === ''}
                            onChange={() => handleFilterChange('brand', '')}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-blue-600">All Brands</span>
                    </label>
                    {availableFilters.brands.map(brand => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="brand"
                                checked={filters.brand === brand}
                                onChange={() => handleFilterChange('brand', brand)}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-blue-600">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Availability */}
            <div className="pt-2 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Exclude Out of Stock</span>
                </label>
            </div>

            <button
                onClick={clearFilters}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
                Clear All Filters
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f1f2f4] pb-20"> {/* Subtle gray background like Flipkart */}
            <Toaster position="bottom-center" />
            <Navbar />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">

                {/* Mobile Filter Toggle & Sort Bar */}
                <div className="lg:hidden sticky top-[60px] z-30 bg-white shadow-sm p-3 mb-4 rounded-lg flex justify-between items-center">
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <select
                        value={`${sortBy}_${sortOrder}`}
                        onChange={handleSortChange}
                        className="border-none text-sm font-semibold bg-transparent focus:ring-0 text-right"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-6">
                    {/* DESKTOP SIDEBAR */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                                <button onClick={clearFilters} className="text-xs text-blue-600 font-medium hover:underline">CLEAR ALL</button>
                            </div>
                            <FilterSection />
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="flex-1 min-w-0">
                        {/* Header & Desktop Sort */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4 hidden lg:flex justify-between items-center">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Building Materials</h1>
                                <p className="text-sm text-gray-500 mt-1">Showing {loading ? '...' : totalProducts} products</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">Sort By:</span>
                                <select
                                    value={`${sortBy}_${sortOrder}`}
                                    onChange={handleSortChange}
                                    className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 py-1.5"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* PRODUCT GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4">
                            {loading ? (
                                Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
                            ) : products.length === 0 ? (
                                <div className="col-span-full bg-white rounded-xl p-12 text-center shadow-sm">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                                    <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
                                    <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                products.map((product) => (
                                    <div key={product._id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col relative">
                                        {/* Badge for Stock/Offer */}
                                        {product.stock === 0 && (
                                            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                                                SOLD OUT
                                            </div>
                                        )}
                                        {product.costPrice > product.price && (
                                            <div className="absolute top-3 left-3 bg-green-500/40 rounded-2xl text-white text-[10px] font-bold px-2 py-1  z-10">
                                                {Math.round(((product.costPrice - product.price) / product.costPrice) * 100)}% OFF
                                            </div>
                                        )}

                                        <Link to={`/product/${product._id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
                                            {product.ProductImage ? (
                                                <img
                                                    src={product.ProductImage}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-4xl">
                                                    {product.name?.[0]}
                                                </div>
                                            )}
                                            {/* Quick Add Button (Visible on Hover) */}
                                            {product.stock > 0 && (
                                                <button
                                                    onClick={(e) => addToCart(e, product)}
                                                    className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white"
                                                    title="Add to Cart"
                                                >
                                                    <ShoppingCart className="w-5 h-5" />
                                                </button>
                                            )}
                                        </Link>

                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                                                    {product.brand || 'Generic'}
                                                </p>
                                                <Link to={`/product/${product._id}`}>
                                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors mb-2" title={product.name}>
                                                        {product.name}
                                                    </h3>
                                                </Link>

                                                {/* Rating Simulation */}
                                                <div className="flex items-center gap-1 ">
                                                    <div className="bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        {product?.rating?.average} <Star className="w-2 h-2 fill-current" />
                                                    </div>
                                                    <span className="text-xs text-gray-400">{product?.rating?.count}</span>
                                                </div>
                                            </div>

                                            <div className="mt-2  border-t border-gray-50">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                                                    {product.costPrice && (
                                                        <span className="text-xs text-gray-400 line-through">₹{product.costPrice.toLocaleString()}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-green-600 font-medium mt-0.5">Free Delivery</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center pb-8">
                                <nav className="flex items-center gap-1 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
                        <FilterSection mobile={true} />
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 w-full z-40">
                <BottomPart />
            </div>
        </div>
    );
};

export default ProductListing;