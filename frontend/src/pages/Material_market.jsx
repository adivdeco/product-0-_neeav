import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import axiosClient from '../api/auth';
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/home/navbar';

const ProductListing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        brand: '',
        inStock: true
    });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [availableFilters, setAvailableFilters] = useState({
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 100000 }
    });

    const sortOptions = [
        { value: 'createdAt_desc', label: 'Newest First' },
        { value: 'createdAt_asc', label: 'Oldest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'name_asc', label: 'Name: A to Z' },
        { value: 'name_desc', label: 'Name: Z to A' },
        { value: 'stock_desc', label: 'Most in Stock' }
    ];

    useEffect(() => {
        fetchProducts();
        fetchAvailableFilters();
    }, [filters, sortBy, sortOrder, currentPage]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 20,
                ...filters,
                sortBy,
                sortOrder
            };

            const response = await axiosClient.get('/products/public/products', { params });
            setProducts(response.data.products);
            setTotalPages(response.data.pagination.totalPages);
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
            setAvailableFilters(response.data.filters);
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1);
    };

    const handleSortChange = (value) => {
        const [sortField, order] = value.split('_');
        setSortBy(sortField);
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
            inStock: true
        });
        setCurrentPage(1);
    };

    const addToCart = (product) => {
        // Implement add to cart functionality
        toast.success(`${product.name} added to cart!`);
    };

    const buyNow = (product) => {
        // Implement buy now functionality
        toast.success(`Proceeding to buy ${product.name}`);
    };

    const getStockStatusColor = (stock, minStockLevel) => {
        if (stock === 0) return 'text-red-600 bg-red-50';
        if (stock <= minStockLevel) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Building Materials</h1>
                    <p className="text-gray-600 mt-2">Find quality construction materials from trusted suppliers</p>
                </div>

                {/* Filters and Sort Bar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-4">
                            <select
                                value={`${sortBy}_${sortOrder}`}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Filter Options */}
                    <div className={`mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Categories</option>
                                {availableFilters.categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        {/* Brand Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                            <select
                                value={filters.brand}
                                onChange={(e) => handleFilterChange('brand', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Brands</option>
                                {availableFilters.brands.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                            <input
                                type="number"
                                placeholder="Min price"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                            <input
                                type="number"
                                placeholder="Max price"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Active Filters and Clear */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Clear All
                        </button>
                        {(filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
                            <span className="text-sm text-gray-600">
                                Active filters applied
                            </span>
                        )}
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <div key={product._id} className="transition-all duration-200 hover:bg-gray-50">
                                    <div className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            {/* Product Info */}
                                            <div className="flex items-start space-x-4 flex-1 min-w-0">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden">
                                                        {product.ProductImage ? (
                                                            <img
                                                                src={product.ProductImage}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                                                <span className="text-white font-semibold text-sm">
                                                                    {product.name?.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        to={`/product/${product._id}`}
                                                        className="hover:text-blue-600 transition-colors"
                                                    >
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                            {product.name}
                                                        </h3>
                                                    </Link>

                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                                        {/* <span>By {product.shopName || 'Unknown Store'}</span> */}
                                                        {/* <span>•</span> */}
                                                        <span>{product.brand || 'No Brand'}</span>
                                                        <span>•</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.stock, product.minStockLevel)}`}>
                                                            {product.stockStatus}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 flex items-center gap-4 text-sm">
                                                        <span className="text-2xl font-bold text-green-600">
                                                            ₹{product.price}
                                                        </span>
                                                        {product.costPrice && (
                                                            <span className="text-gray-500 line-through">
                                                                ₹{product.costPrice}
                                                            </span>
                                                        )}
                                                        {/* {product.taxRate && (
                                                            <span className="text-gray-500">
                                                                +{product.taxRate}% tax
                                                            </span>
                                                        )} */}
                                                    </div>

                                                    <div className="mt-2 text-sm text-gray-600">
                                                        <span>Category: {product.category}</span>
                                                        {product.size && (
                                                            <span className="ml-3">Size: {product.size}</span>
                                                        )}
                                                        {product.unit && (
                                                            <span className="ml-3">Unit: {product.unit}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    disabled={product.stock === 0}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                                >
                                                    Add to Cart
                                                </button>
                                                <button
                                                    onClick={() => buyNow(product)}
                                                    disabled={product.stock === 0}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-center items-center space-x-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListing;