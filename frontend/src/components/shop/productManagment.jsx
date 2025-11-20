import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import axiosClient from '../../api/auth';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [updateLoading, setUpdateLoading] = useState({});
    const [stockUpdate, setStockUpdate] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const { user } = useSelector((state) => state.auth);

    const categories = [
        'Cement & Concrete',
        'Bricks & Blocks',
        'Steel & Reinforcement',
        'Sand & Aggregates',
        'Paints & Finishes',
        'Tools & Equipment',
        'Plumbing',
        'Electrical',
        'Tiles & Sanitary',
        'Hardware & Fittings',
        'Other'
    ];

    const stockStatusOptions = [
        { value: '', label: 'All Stock Status' },
        { value: 'in_stock', label: 'In Stock' },
        { value: 'low_stock', label: 'Low Stock' },
        { value: 'out_of_stock', label: 'Out of Stock' }
    ];

    useEffect(() => {
        fetchProducts();
    }, [searchTerm, selectedCategory, stockFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: 1,
                limit: 50,
                ...(searchTerm && { search: searchTerm }),
                ...(selectedCategory && { category: selectedCategory }),
                ...(stockFilter && { stockStatus: stockFilter })
            };

            const response = await axiosClient.get('/products/allProduct', { params });
            console.log(response.data.products);

            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product) => {
        setSelectedProduct(selectedProduct?._id === product._id ? null : product);
    };

    const handleStatusToggle = async (productId, currentStatus) => {
        try {
            setUpdateLoading(prev => ({ ...prev, [productId]: true }));
            const newStatus = !currentStatus;

            await axiosClient.patch(`/products/${productId}/status`, {
                isActive: newStatus
            });

            setProducts(prev => prev.map(product =>
                product._id === productId
                    ? { ...product, isActive: newStatus }
                    : product
            ));

            toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update product status');
        } finally {
            setUpdateLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleStockUpdate = async (productId) => {
        if (!stockUpdate[productId] && stockUpdate[productId] !== 0) return;

        try {
            setUpdateLoading(prev => ({ ...prev, [productId]: true }));

            await axiosClient.patch(`/products/${productId}/stock`, {
                stock: stockUpdate[productId]
            });

            setProducts(prev => prev.map(product =>
                product._id === productId
                    ? { ...product, stock: stockUpdate[productId] }
                    : product
            ));

            setStockUpdate(prev => ({ ...prev, [productId]: '' }));
            toast.success('Stock updated successfully');
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Failed to update stock');
        } finally {
            setUpdateLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            setUpdateLoading(prev => ({ ...prev, [productToDelete._id]: true }));

            await axiosClient.delete(`/products/${productToDelete._id}`);

            setProducts(prev => prev.filter(product => product._id !== productToDelete._id));
            setSelectedProduct(null);
            toast.success('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        } finally {
            setUpdateLoading(prev => ({ ...prev, [productToDelete._id]: false }));
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    const getStockStatusColor = (stock, minStockLevel) => {
        if (stock === 0) return 'bg-red-100 text-red-800 border-red-200';
        if (stock <= minStockLevel) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    const getStockStatusText = (stock, minStockLevel) => {
        if (stock === 0) return 'Out of Stock';
        if (stock <= minStockLevel) return 'Low Stock';
        return 'In Stock';
    };

    const getStatusBadgeColor = (isActive) => {
        return isActive
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-red-100 text-red-800 border-red-200';
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setStockFilter('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            {/* Navbar would go here */}
            {/* <Navbar /> */}

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                            <p className="text-gray-600 mt-2">Manage all products in your store</p>
                        </div>
                        <Link
                            to="/addProducts"
                            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition duration-150"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Product
                        </Link>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Products
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name, brand, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Status
                            </label>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                            >
                                {stockStatusOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Results
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-gray-900 font-semibold">
                                    {products.length} product{products.length !== 1 ? 's' : ''} found
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
                                    <div className="p-6 cursor-pointer" onClick={() => handleProductClick(product)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
                                                        {product.ProductImage ? (
                                                            <img
                                                                src={product.ProductImage}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-white font-semibold text-lg">
                                                                {product.name?.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                            {product.name}
                                                        </h3>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(product.isActive)}`}>
                                                            {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStatusColor(product.stock, product.minStockLevel)}`}>
                                                            {getStockStatusText(product.stock, product.minStockLevel)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-6">
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            🏷️ {product.category}
                                                        </p>
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            💰 ₹{product.price}
                                                        </p>
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            📦 {product.stock} {product.unit}
                                                        </p>
                                                        {product.brand && (
                                                            <p className="text-sm text-gray-600 flex items-center">
                                                                🏭 {product.brand}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusToggle(product._id, product.isActive);
                                                    }}
                                                    disabled={updateLoading[product._id]}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150 disabled:opacity-50"
                                                >
                                                    {product.isActive ? '🚫 Deactivate' : '✅ Activate'}
                                                </button>
                                                <Link
                                                    to={`/edit-product/${product._id}`}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
                                                >
                                                    ✏️ Edit
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(product);
                                                    }}
                                                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition duration-150"
                                                >
                                                    🗑️ Delete
                                                </button>
                                                <div className={`transform transition-transform duration-200 ${selectedProduct?._id === product._id ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedProduct?._id === product._id && (
                                        <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                                                {/* Basic Information */}
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900">Basic Information</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Product Name</label>
                                                            <p className="text-gray-900">{product.name}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Category</label>
                                                            <p className="text-gray-900">{product.category}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Brand</label>
                                                            <p className="text-gray-900">{product.brand || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Model</label>
                                                            <p className="text-gray-900">{product.model || 'Not specified'}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                                        <p className="text-gray-900 mt-1">{product.description || 'No description available'}</p>
                                                    </div>
                                                </div>

                                                {/* Pricing & Inventory */}
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900">Pricing & Inventory</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Selling Price</label>
                                                            <p className="text-green-600 font-bold">₹{product.price}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Cost Price</label>
                                                            <p className="text-gray-900">{product.costPrice ? `₹${product.costPrice}` : 'Not set'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Tax Rate</label>
                                                            <p className="text-gray-900">{product.taxRate}%</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Unit</label>
                                                            <p className="text-gray-900">{product.unit}</p>
                                                        </div>
                                                    </div>

                                                    {/* Stock Management */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Current Stock</label>
                                                                <p className="text-gray-900">{product.stock} {product.unit}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Min Stock Level</label>
                                                                <p className="text-gray-900">{product.minStockLevel} {product.unit}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                placeholder="Update stock quantity"
                                                                value={stockUpdate[product._id] || ''}
                                                                onChange={(e) => setStockUpdate(prev => ({
                                                                    ...prev,
                                                                    [product._id]: e.target.value
                                                                }))}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                                            />
                                                            <button
                                                                onClick={() => handleStockUpdate(product._id)}
                                                                disabled={updateLoading[product._id]}
                                                                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                                                            >
                                                                {updateLoading[product._id] ? 'Updating...' : 'Update Stock'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900">Product Details</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Size</label>
                                                            <p className="text-gray-900">{product.size || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Weight</label>
                                                            <p className="text-gray-900">{product.weight ? `${product.weight} kg` : 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Color</label>
                                                            <p className="text-gray-900">{product.color || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">HSN Code</label>
                                                            <p className="text-gray-900">{product.hsnCode || 'Not specified'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Supplier Information */}
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900">Supplier Information</h4>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Supplier</label>
                                                            <p className="text-gray-900">{product.supplier || 'Not specified'}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex-1">
                                                                <label className="text-sm font-medium text-gray-600">Created</label>
                                                                <p className="text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                                                <p className="text-gray-900">{new Date(product.updatedAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <span className="text-red-600 text-xl">⚠️</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete Product
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition duration-150"
                                >
                                    Delete Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;