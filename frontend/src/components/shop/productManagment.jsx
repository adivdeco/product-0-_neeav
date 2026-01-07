// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router';
// import axiosClient from '../../api/auth';
// import { useSelector } from "react-redux";
// import { toast } from 'react-toastify';
// import { Toaster } from 'react-hot-toast';
// import Navbar from '../home/navbar';

// const ProductManagement = () => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedCategory, setSelectedCategory] = useState('');
//     const [stockFilter, setStockFilter] = useState('');
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [updateLoading, setUpdateLoading] = useState({});
//     const [stockUpdate, setStockUpdate] = useState({});
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [productToDelete, setProductToDelete] = useState(null);
//     const [isFilterOpen, setIsFilterOpen] = useState(false);

//     const { user } = useSelector((state) => state.auth);

//     const categories = [
//         'Cement & Concrete',
//         'Bricks & Blocks',
//         'Steel & Reinforcement',
//         'Sand & Aggregates',
//         'Paints & Finishes',
//         'Tools & Equipment',
//         'Plumbing',
//         'Electrical',
//         'Tiles & Sanitary',
//         'Hardware & Fittings',
//         'Other'
//     ];

//     const stockStatusOptions = [
//         { value: '', label: 'All Stock Status' },
//         { value: 'in_stock', label: 'In Stock' },
//         { value: 'low_stock', label: 'Low Stock' },
//         { value: 'out_of_stock', label: 'Out of Stock' }
//     ];

//     useEffect(() => {
//         fetchProducts();
//     }, [searchTerm, selectedCategory, stockFilter]);

//     const fetchProducts = async () => {
//         try {
//             setLoading(true);
//             const params = {
//                 page: 1,
//                 limit: 50,
//                 ...(searchTerm && { search: searchTerm }),
//                 ...(selectedCategory && { category: selectedCategory }),
//                 ...(stockFilter && { stockStatus: stockFilter })
//             };

//             const response = await axiosClient.get('/products/allProduct', { params });
//             console.log(response.data.products);

//             setProducts(response.data.products);
//         } catch (error) {
//             console.error('Error fetching products:', error);
//             toast.error('Failed to fetch products');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleProductClick = (product) => {
//         setSelectedProduct(selectedProduct?._id === product._id ? null : product);
//     };

//     const handleStatusToggle = async (productId, currentStatus) => {
//         try {
//             setUpdateLoading(prev => ({ ...prev, [productId]: true }));
//             const newStatus = !currentStatus;

//             await axiosClient.patch(`/products/${productId}/status`, {
//                 isActive: newStatus
//             });

//             setProducts(prev => prev.map(product =>
//                 product._id === productId
//                     ? { ...product, isActive: newStatus }
//                     : product
//             ));

//             toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
//         } catch (error) {
//             console.error('Error updating status:', error);
//             toast.error('Failed to update product status');
//         } finally {
//             setUpdateLoading(prev => ({ ...prev, [productId]: false }));
//         }
//     };

//     const handleStockUpdate = async (productId) => {
//         if (!stockUpdate[productId] && stockUpdate[productId] !== 0) return;

//         try {
//             setUpdateLoading(prev => ({ ...prev, [productId]: true }));

//             await axiosClient.patch(`/products/${productId}/stock`, {
//                 stock: stockUpdate[productId]
//             });

//             setProducts(prev => prev.map(product =>
//                 product._id === productId
//                     ? { ...product, stock: stockUpdate[productId] }
//                     : product
//             ));

//             setStockUpdate(prev => ({ ...prev, [productId]: '' }));
//             toast.success('Stock updated successfully');
//         } catch (error) {
//             console.error('Error updating stock:', error);
//             toast.error('Failed to update stock');
//         } finally {
//             setUpdateLoading(prev => ({ ...prev, [productId]: false }));
//         }
//     };

//     const handleDeleteClick = (product) => {
//         setProductToDelete(product);
//         setShowDeleteModal(true);
//     };

//     const confirmDelete = async () => {
//         if (!productToDelete) return;

//         try {
//             setUpdateLoading(prev => ({ ...prev, [productToDelete._id]: true }));

//             await axiosClient.delete(`/products/${productToDelete._id}`);

//             setProducts(prev => prev.filter(product => product._id !== productToDelete._id));
//             setSelectedProduct(null);
//             toast.success('Product deleted successfully');
//         } catch (error) {
//             console.error('Error deleting product:', error);
//             toast.error('Failed to delete product');
//         } finally {
//             setUpdateLoading(prev => ({ ...prev, [productToDelete._id]: false }));
//             setShowDeleteModal(false);
//             setProductToDelete(null);
//         }
//     };

//     const getStockStatusColor = (stock, minStockLevel) => {
//         if (stock === 0) return 'bg-red-100 text-red-800 border-red-200';
//         if (stock <= minStockLevel) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//         return 'bg-green-100 text-green-800 border-green-200';
//     };

//     const getStockStatusText = (stock, minStockLevel) => {
//         if (stock === 0) return 'No Stock';
//         if (stock <= minStockLevel) return 'Low Stock';
//         return 'In Stock';
//     };

//     const getStatusBadgeColor = (isActive) => {
//         return isActive
//             ? 'bg-green-100 text-green-800 border-green-200'
//             : 'bg-red-100 text-red-800 border-red-200';
//     };

//     const clearFilters = () => {
//         setSearchTerm('');
//         setSelectedCategory('');
//         setStockFilter('');
//         setIsFilterOpen(false);
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 mt-0.5">
//             <Toaster position="top-right" />

//             {/* Navbar would go here */}
//             <Navbar />

//             <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
//                         <div className="text-center xs:text-left flex-1">
//                             <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
//                             <p className="text-gray-600 mt-1 text-xs xs:text-sm sm:text-base">
//                                 Manage all products in your store
//                             </p>
//                         </div>
//                         <Link
//                             to="/addProducts"
//                             className="inline-flex items-center px-3 py-2 xs:px-4 xs:py-2 sm:px-6 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition duration-150 w-full xs:w-auto justify-center text-xs xs:text-sm sm:text-base whitespace-nowrap"
//                         >
//                             <svg className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                             </svg>
//                             Add Product
//                         </Link>
//                     </div>
//                 </div>

//                 {/* Filters and Search */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//                     {/* Mobile Filter Dropdown */}
//                     <div className="md:hidden mb-1">
//                         <button
//                             onClick={() => setIsFilterOpen(!isFilterOpen)}
//                             className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                         >
//                             <span className="text-sm font-medium text-gray-700">
//                                 <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
//                                 </svg>
//                                 Filters
//                             </span>
//                             <svg
//                                 className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                         </button>
//                     </div>

//                     {/* Filter Content */}
//                     <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block`}>
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                             {/* Search */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Search Products
//                                 </label>
//                                 <input
//                                     type="text"
//                                     placeholder="Search by name, brand, or description..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                 />
//                             </div>

//                             {/* Category Filter */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Filter by Category
//                                 </label>
//                                 <select
//                                     value={selectedCategory}
//                                     onChange={(e) => setSelectedCategory(e.target.value)}
//                                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                 >
//                                     <option value="">All Categories</option>
//                                     {categories.map(category => (
//                                         <option key={category} value={category}>{category}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Stock Filter */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Stock Status
//                                 </label>
//                                 <select
//                                     value={stockFilter}
//                                     onChange={(e) => setStockFilter(e.target.value)}
//                                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                 >
//                                     {stockStatusOptions.map(option => (
//                                         <option key={option.value} value={option.value}>{option.label}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Results */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Results
//                                 </label>
//                                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
//                                     <span className="text-gray-900 font-semibold">
//                                         {products.length} product{products.length !== 1 ? 's' : ''} found
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Clear Filters Button - Mobile Only */}
//                         <div className="mt-4 md:hidden">
//                             <button
//                                 onClick={clearFilters}
//                                 className="w-full py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-300"
//                             >
//                                 Clear All Filters
//                             </button>
//                         </div>
//                     </div>

//                     {/* Clear Filters Button - Desktop Only */}
//                     <div className="hidden md:flex justify-end mt-4">
//                         <button
//                             onClick={clearFilters}
//                             className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-300"
//                         >
//                             Clear All Filters
//                         </button>
//                     </div>
//                 </div>

//                 {/* Products List */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                     {loading ? (
//                         <div className="flex justify-center items-center py-12">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//                         </div>
//                     ) : products.length === 0 ? (
//                         <div className="text-center py-12">
//                             <div className="text-gray-400 text-6xl mb-4">📦</div>
//                             <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
//                             <p className="text-gray-500">Try adjusting your search or filters</p>
//                         </div>
//                     ) : (
//                         <div className="divide-y divide-gray-200">
//                             {products.map((product) => (
//                                 <div key={product._id} className="transition-all duration-200 hover:bg-gray-50">
//                                     <div className="p-4 sm:p-6 cursor-pointer" onClick={() => handleProductClick(product)}>
//                                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

//                                             {/* Left Section - Product Info */}
//                                             <div className="flex items-start space-x-3 sm:space-x-4 w-full sm:w-auto">
//                                                 {/* IMAGE */}
//                                                 <div className="flex-shrink-0">
//                                                     <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden">
//                                                         {product.ProductImage ? (
//                                                             <img
//                                                                 src={product.ProductImage}
//                                                                 alt={product.name}
//                                                                 className="w-full h-full object-cover"
//                                                             />
//                                                         ) : (
//                                                             <span className="text-white font-semibold text-sm sm:text-lg">
//                                                                 {product.name?.charAt(0).toUpperCase()}
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>

//                                                 {/* DETAILS */}
//                                                 <div className="flex-1 min-w-0">
//                                                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
//                                                         <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
//                                                             {product.name}
//                                                         </h3>
//                                                         <div className="flex items-center gap-2 flex-wrap">
//                                                             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${getStatusBadgeColor(product.isActive)}`}>
//                                                                 {product.isActive ? 'ACTIVE' : 'INACTIVE'}
//                                                             </span>
//                                                             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${getStockStatusColor(product.stock, product.minStockLevel)}`}>
//                                                                 {getStockStatusText(product.stock, product.minStockLevel)}
//                                                             </span>
//                                                         </div>
//                                                     </div>

//                                                     {/* Mobile simplified info */}
//                                                     <div className="sm:hidden flex flex-col gap-1 text-xs text-gray-600">
//                                                         <div className="flex items-center gap-3">
//                                                             <span>₹{product.price}</span>
//                                                             <span>•</span>
//                                                             <span>{product.stock} {product.unit}</span>
//                                                         </div>
//                                                         {product.category && (
//                                                             <span className="text-gray-500">Category: {product.category}</span>
//                                                         )}
//                                                     </div>

//                                                     {/* Desktop detailed info */}
//                                                     <div className="hidden sm:flex items-center space-x-4 sm:space-x-6">
//                                                         <p className="text-sm text-gray-600 flex items-center">
//                                                             🏷️ {product.category}
//                                                         </p>
//                                                         <p className="text-sm text-gray-600 flex items-center">
//                                                             💰 ₹{product.price}
//                                                         </p>
//                                                         <p className="text-sm text-gray-600 flex items-center">
//                                                             📦 {product.stock} {product.unit}
//                                                         </p>
//                                                         {product.brand && (
//                                                             <p className="text-sm text-gray-600 flex items-center">
//                                                                 🏭 {product.brand}
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Right Section - Actions */}
//                                             <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
//                                                 <div className="flex items-center gap-2">
//                                                     {/* Edit Button */}
//                                                     <Link
//                                                         to={`/edit-product/${product._id}`}
//                                                         className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
//                                                     >
//                                                         <span className="sm:hidden">✏️</span>
//                                                         <span className="hidden sm:inline">✏️ Edit</span>
//                                                     </Link>

//                                                     {/* Status Toggle Button */}
//                                                     <button
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             handleStatusToggle(product._id, product.isActive);
//                                                         }}
//                                                         disabled={updateLoading[product._id]}
//                                                         className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150 disabled:opacity-50"
//                                                     >
//                                                         <span className="sm:hidden">{product.isActive ? '🚫' : '✅'}</span>
//                                                         <span className="hidden sm:inline">
//                                                             {product.isActive ? '🚫 Deactivate' : '✅ Activate'}
//                                                         </span>
//                                                     </button>

//                                                     {/* Delete Button */}
//                                                     <button
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             handleDeleteClick(product);
//                                                         }}
//                                                         className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 border border-red-300 rounded-lg text-xs sm:text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition duration-150"
//                                                     >
//                                                         <span className="sm:hidden">🗑️</span>
//                                                         <span className="hidden sm:inline">🗑️ Delete</span>
//                                                     </button>
//                                                 </div>

//                                                 {/* Dropdown Arrow */}
//                                                 <div className={`transform transition-transform duration-200 ${selectedProduct?._id === product._id ? 'rotate-180' : ''}`}>
//                                                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                                                     </svg>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Expanded Details */}
//                                     {selectedProduct?._id === product._id && (
//                                         <div className="px-4 sm:px-6 pb-4 sm:pb-6 bg-gray-50 border-t border-gray-200">
//                                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6">

//                                                 {/* Basic Information */}
//                                                 <div className="space-y-3 sm:space-y-4">
//                                                     <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Basic Information</h4>
//                                                     <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Product Name</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.name}</p>
//                                                         </div>
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Category</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.category}</p>
//                                                         </div>
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Brand</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.brand || 'Not specified'}</p>
//                                                         </div>
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Model</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.model || 'Not specified'}</p>
//                                                         </div>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-xs sm:text-sm font-medium text-gray-600">Description</label>
//                                                         <p className="text-gray-900 text-sm sm:text-base mt-1">{product.description || 'No description available'}</p>
//                                                     </div>
//                                                 </div>

//                                                 {/* Pricing & Inventory */}
//                                                 <div className="space-y-3 sm:space-y-4">
//                                                     <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Pricing & Inventory</h4>
//                                                     <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Selling Price</label>
//                                                             <p className="text-green-600 font-bold text-sm sm:text-base">₹{product.price}</p>
//                                                         </div>
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Cost Price</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.costPrice ? `₹${product.costPrice}` : 'Not set'}</p>
//                                                         </div>
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Tax Rate</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.taxRate}%</p>
//                                                         </div>
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Unit</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.unit}</p>
//                                                         </div>
//                                                     </div>

//                                                     {/* Stock Management */}
//                                                     <div className="space-y-2 sm:space-y-3">
//                                                         <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
//                                                             <div>
//                                                                 <label className="text-xs sm:text-sm font-medium text-gray-600">Current Stock</label>
//                                                                 <p className="text-gray-900 text-sm sm:text-base">{product.stock} {product.unit}</p>
//                                                             </div>
//                                                             <div>
//                                                                 <label className="text-xs sm:text-sm font-medium text-gray-600">Min Stock Level</label>
//                                                                 <p className="text-gray-900 text-sm sm:text-base">{product.minStockLevel} {product.unit}</p>
//                                                             </div>
//                                                         </div>

//                                                         <div className="flex flex-col sm:flex-row gap-2">
//                                                             <input
//                                                                 type="number"
//                                                                 placeholder="Update stock"
//                                                                 value={stockUpdate[product._id] || ''}
//                                                                 onChange={(e) => setStockUpdate(prev => ({
//                                                                     ...prev,
//                                                                     [product._id]: e.target.value
//                                                                 }))}
//                                                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
//                                                             />
//                                                             <button
//                                                                 onClick={() => handleStockUpdate(product._id)}
//                                                                 disabled={updateLoading[product._id]}
//                                                                 className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 whitespace-nowrap"
//                                                             >
//                                                                 {updateLoading[product._id] ? 'Updating...' : 'Update Stock'}
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                 </div>

//                                                 {/* Product Details */}
//                                                 <div className="space-y-3 sm:space-y-4">
//                                                     <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Product Details</h4>
//                                                     <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Size</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.size || 'Not specified'}</p>
//                                                         </div>
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Weight</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.weight ? `${product.weight} kg` : 'Not specified'}</p>
//                                                         </div>
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Color</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.color || 'Not specified'}</p>
//                                                         </div>
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">HSN Code</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.hsnCode || 'Not specified'}</p>
//                                                         </div>
//                                                     </div>
//                                                 </div>

//                                                 {/* Supplier Information */}
//                                                 <div className="space-y-3 sm:space-y-4">
//                                                     <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Supplier Information</h4>
//                                                     <div className="grid grid-cols-1 gap-3 sm:gap-4">
//                                                         <div>
//                                                             <label className="text-xs sm:text-sm font-medium text-gray-600">Supplier</label>
//                                                             <p className="text-gray-900 text-sm sm:text-base">{product.supplier || 'Not specified'}</p>
//                                                         </div>
//                                                         <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-4 gap-2">
//                                                             <div className="flex-1">
//                                                                 <label className="text-xs sm:text-sm font-medium text-gray-600">Created</label>
//                                                                 <p className="text-gray-900 text-sm sm:text-base">{new Date(product.createdAt).toLocaleDateString()}</p>
//                                                             </div>
//                                                             <div className="flex-1">
//                                                                 <label className="text-xs sm:text-sm font-medium text-gray-600">Last Updated</label>
//                                                                 <p className="text-gray-900 text-sm sm:text-base">{new Date(product.updatedAt).toLocaleDateString()}</p>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Delete Confirmation Modal */}
//             {showDeleteModal && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
//                     <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6">
//                         <div className="text-center">
//                             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
//                                 <span className="text-red-600 text-xl">⚠️</span>
//                             </div>
//                             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                                 Delete Product
//                             </h3>
//                             <p className="text-gray-600 mb-6">
//                                 Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
//                             </p>
//                             <div className="flex space-x-3">
//                                 <button
//                                     onClick={() => setShowDeleteModal(false)}
//                                     className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition duration-150"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={confirmDelete}
//                                     className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition duration-150"
//                                 >
//                                     Delete Product
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProductManagement;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import axiosClient from '../../api/auth';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import Navbar from '../home/navbar';
import { Truck, Package, DollarSign, Save } from 'lucide-react'; // 




const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Tracks loading state for specific buttons
    const [updateLoading, setUpdateLoading] = useState({});

    // Single state object to track all temporary inputs (Price, Stock, Shipping)
    // Keys: 'variantId_stock', 'variantId_price', 'productId_shipCost', 'productId_shipDays'
    const [editValues, setEditValues] = useState({});

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { user } = useSelector((state) => state.auth);

    const categories = [
        'Cement & Concrete', 'Bricks & Blocks', 'Steel & Reinforcement',
        'Sand & Aggregates', 'Paints & Finishes', 'Tools & Equipment',
        'Plumbing', 'Electrical', 'Tiles & Sanitary', 'Hardware & Fittings', 'Other'
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

    // Handle Input Changes
    const handleInputChange = (key, value) => {
        setEditValues(prev => ({ ...prev, [key]: value }));
    };

    // --- 1. UPDATE VARIANT (Price & Stock) ---
    const handleVariantUpdate = async (product, variant) => {
        const stockKey = `${variant._id}_stock`;
        const priceKey = `${variant._id}_price`;
        const costPriceKey = `${variant._id}_costPrice`;

        // Get new values or fallback to existing
        const newStock = editValues[stockKey] !== undefined ? Number(editValues[stockKey]) : variant.stock;
        const newPrice = editValues[priceKey] !== undefined ? Number(editValues[priceKey]) : variant.price;
        const newCostPrice = editValues[costPriceKey] !== undefined ? Number(editValues[costPriceKey]) : variant.costPrice;
        // If nothing changed, don't API call
        if (newStock === variant.stock && newPrice === variant.price && newCostPrice === variant.costPrice) return;

        try {
            setUpdateLoading(prev => ({ ...prev, [variant._id]: true }));

            // We need to construct the updated variants array for the PUT request
            const updatedVariants = product.variants.map(v =>
                v._id === variant._id
                    ? { ...v, stock: newStock, price: newPrice, costPrice: newCostPrice }
                    : v
            );

            // Send full update to backend
            await axiosClient.put(`/products/${product._id}`, {
                variants: updatedVariants
            });

            // Update local state
            setProducts(prev => prev.map(p => {
                if (p._id === product._id) {
                    // Recalc total stock for display
                    const totalStock = updatedVariants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
                    return { ...p, variants: updatedVariants, totalStock };
                }
                return p;
            }));

            toast.success('Variant updated successfully');

            // Clear dirty state for this variant
            setEditValues(prev => {
                const newState = { ...prev };
                delete newState[stockKey];
                delete newState[priceKey];
                return newState;
            });

        } catch (error) {
            console.error('Error updating variant:', error);
            toast.error('Failed to update variant');
        } finally {
            setUpdateLoading(prev => ({ ...prev, [variant._id]: false }));
        }
    };

    // --- 2. UPDATE SHIPPING ---
    const handleShippingUpdate = async (product) => {
        const costKey = `${product._id}_shipCost`;
        const daysKey = `${product._id}_shipDays`;

        const newCost = editValues[costKey] !== undefined ? Number(editValues[costKey]) : (product.shipping?.cost || 0);
        const newDays = editValues[daysKey] !== undefined ? editValues[daysKey] : (product.shipping?.estimatedDays || '');

        try {
            setUpdateLoading(prev => ({ ...prev, [`ship_${product._id}`]: true }));

            const updatedShipping = {
                isFree: newCost === 0,
                cost: newCost,
                estimatedDays: newDays
            };

            await axiosClient.put(`/products/${product._id}`, {
                shipping: updatedShipping
            });

            // Update local state
            setProducts(prev => prev.map(p =>
                p._id === product._id ? { ...p, shipping: updatedShipping } : p
            ));

            toast.success('Shipping details updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update shipping');
        } finally {
            setUpdateLoading(prev => ({ ...prev, [`ship_${product._id}`]: false }));
        }
    };

    const handleStatusToggle = async (productId, currentStatus) => {
        try {
            setUpdateLoading(prev => ({ ...prev, [productId]: true }));
            const newStatus = !currentStatus;
            await axiosClient.patch(`/products/${productId}/status`, { isActive: newStatus });
            setProducts(prev => prev.map(product => product._id === productId ? { ...product, isActive: newStatus } : product));
            toast.success(`Product ${newStatus ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update status');
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
            toast.success('Product deleted');
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setUpdateLoading(prev => ({ ...prev, [productToDelete._id]: false }));
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    // Helpers
    const getTotalStock = (product) => product.totalStock !== undefined ? product.totalStock : (product.variants?.reduce((acc, curr) => acc + (curr.stock || 0), 0) || 0);
    const getMinStockLevel = (product) => product.variants?.reduce((acc, curr) => Math.min(acc, curr.minStockLevel || 5), 100) || 5;
    const getPriceDisplay = (product) => {
        if (!product.variants || product.variants.length === 0) return 'N/A';
        const prices = product.variants.map(v => v.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
    };
    const getStockStatusColor = (stock, minStockLevel) => {
        if (stock === 0) return 'bg-red-100 text-red-800 border-red-200';
        if (stock <= minStockLevel) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };
    const getStockStatusText = (stock, minStockLevel) => {
        if (stock === 0) return 'No Stock';
        if (stock <= minStockLevel) return 'Low Stock';
        return 'In Stock';
    };
    const getStatusBadgeColor = (isActive) => isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setStockFilter('');
        setIsFilterOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 mt-0.5">
            <Toaster position="top-right" />
            <Navbar />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
                        <div className="text-center xs:text-left flex-1">
                            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
                            <p className="text-gray-600 mt-1 text-xs xs:text-sm sm:text-base">Manage all products in your store</p>
                        </div>
                        <Link to="/addProducts" className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition duration-150 text-sm">
                            + Add Product
                        </Link>
                    </div>
                </div>

                {/* Filters (Kept exactly as your design) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="md:hidden mb-1">
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Filters</span>
                            <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                    <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <input type="text" placeholder="Name, brand..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition">
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                                <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition">
                                    {stockStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><span className="text-gray-900 font-semibold">{products.length} Items</span></div>
                            </div>
                        </div>
                        <div className="hidden md:flex justify-end mt-4"><button onClick={clearFilters} className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition">Clear Filters</button></div>
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12"><h3 className="text-lg font-medium text-gray-900">No products found</h3></div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {products.map((product) => {
                                const totalStock = getTotalStock(product);
                                const minStock = getMinStockLevel(product);

                                return (
                                    <div key={product._id} className="transition-all duration-200 hover:bg-gray-50">
                                        <div className="p-4 sm:p-6 cursor-pointer" onClick={() => handleProductClick(product)}>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                {/* Product Info Summary */}
                                                <div className="flex items-start space-x-3 sm:space-x-4 w-full sm:w-auto">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden">
                                                            {product.ProductImage ? <img src={product.ProductImage} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-white font-semibold text-lg">{product.name?.charAt(0)}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                                                            <div className="flex gap-2">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStatusBadgeColor(product.isActive)}`}>{product.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStockStatusColor(totalStock, minStock)}`}>{getStockStatusText(totalStock, minStock)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="hidden sm:flex space-x-6 text-sm text-gray-600">
                                                            <span>🏷️ {product.category}</span>
                                                            <span>💰 {getPriceDisplay(product)}</span>
                                                            <span>📦 Total: {totalStock}</span>
                                                        </div>
                                                        <div className="sm:hidden text-xs text-gray-600">{getPriceDisplay(product)} • Stock: {totalStock}</div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/edit-product/${product._id}`} className="p-2 border rounded-lg hover:bg-gray-50"><span className="hidden sm:inline">✏️ Edit</span><span className="sm:hidden">✏️</span></Link>
                                                    <button onClick={(e) => { e.stopPropagation(); handleStatusToggle(product._id, product.isActive); }} disabled={updateLoading[product._id]} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                                        <span className="hidden sm:inline">{product.isActive ? '🚫 Deactivate' : '✅ Activate'}</span><span className="sm:hidden">{product.isActive ? '🚫' : '✅'}</span>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(product); }} className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"><span className="hidden sm:inline">🗑️ Delete</span><span className="sm:hidden">🗑️</span></button>
                                                    <div className={`transform transition ${selectedProduct?._id === product._id ? 'rotate-180' : ''}`}><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded: VARIANTS & SHIPPING */}
                                        {selectedProduct?._id === product._id && (
                                            <div className="px-4 sm:px-6 pb-6 bg-gray-50 border-t border-gray-200">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">

                                                    {/* 1. Variants Management */}
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2"><Package className="w-4 h-4" /> Variants Pricing & Stock</h4>
                                                        <div className="space-y-3">
                                                            {product.variants?.map((variant) => (
                                                                <div key={variant._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                                    <div className="flex justify-between mb-3">
                                                                        <span className="font-bold text-gray-800">{variant.variantName || variant.size || 'Standard'}</span>
                                                                        <span className="text-xs text-gray-500">SKU: {variant.sku || '-'}</span>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4">

                                                                        {/* update costPrice */}

                                                                        <div>
                                                                            <label className="text-xs text-gray-500 block mb-1">costPrice (₹)</label>
                                                                            <div className="flex">
                                                                                <input
                                                                                    type="number"
                                                                                    value={editValues[`${variant._id}_costPrice`] ?? variant.costPrice}
                                                                                    onChange={(e) => handleInputChange(`${variant._id}_costPrice`, e.target.value)}
                                                                                    className="w-full px-2 py-1 text-sm border rounded-l focus:ring-1 focus:ring-gray-500"
                                                                                />
                                                                                <span className="bg-gray-100 border border-l-0 px-2 py-1 rounded-r text-gray-500 text-xs flex items-center">₹</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Update Price */}
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 block mb-1">Price (₹)</label>
                                                                            <div className="flex">
                                                                                <input
                                                                                    type="number"
                                                                                    value={editValues[`${variant._id}_price`] ?? variant.price}
                                                                                    onChange={(e) => handleInputChange(`${variant._id}_price`, e.target.value)}
                                                                                    className="w-full px-2 py-1 text-sm border rounded-l focus:ring-1 focus:ring-gray-500"
                                                                                />
                                                                                <span className="bg-gray-100 border border-l-0 px-2 py-1 rounded-r text-gray-500 text-xs flex items-center">₹</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Update Stock */}
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 block mb-1">Stock</label>
                                                                            <div className="flex">
                                                                                <input
                                                                                    type="number"
                                                                                    value={editValues[`${variant._id}_stock`] ?? variant.stock}
                                                                                    onChange={(e) => handleInputChange(`${variant._id}_stock`, e.target.value)}
                                                                                    className="w-full px-2 py-1 text-sm border rounded-l focus:ring-1 focus:ring-gray-500"
                                                                                />
                                                                                <span className="bg-gray-100 border border-l-0 px-2 py-1 rounded-r text-gray-500 text-xs flex items-center">{variant.unit}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Update Button per variant */}
                                                                    <button
                                                                        onClick={() => handleVariantUpdate(product, variant)}
                                                                        disabled={updateLoading[variant._id]}
                                                                        className="w-full mt-3 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium py-2 rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
                                                                    >
                                                                        {updateLoading[variant._id] ? 'Saving...' : <><Save className="w-3 h-3" /> Update Variant</>}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* 2. Shipping & Basic Info */}
                                                    <div className="space-y-6">
                                                        {/* Basic Info Block */}
                                                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                                                            <h4 className="font-semibold text-gray-900 text-sm">Product Info</h4>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div><span className="text-gray-500 text-xs block">Brand</span> {product.brand || '-'}</div>
                                                                <div><span className="text-gray-500 text-xs block">Supplier</span> {product.supplier || '-'}</div>
                                                                <div><span className="text-gray-500 text-xs block">HSN</span> {product.hsnCode || '-'}</div>
                                                                <div><span className="text-gray-500 text-xs block">Tax</span> {product.taxRate}%</div>
                                                            </div>
                                                        </div>

                                                        {/* Shipping Configuration */}
                                                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
                                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm"><Truck className="w-4 h-4" /> Shipping Settings</h4>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-xs text-gray-500 block mb-1">Cost (₹)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={editValues[`${product._id}_shipCost`] ?? (product.shipping?.cost || 0)}
                                                                        onChange={(e) => handleInputChange(`${product._id}_shipCost`, e.target.value)}
                                                                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-gray-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-gray-500 block mb-1">Est. Days</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editValues[`${product._id}_shipDays`] ?? (product.shipping?.estimatedDays || '')}
                                                                        onChange={(e) => handleInputChange(`${product._id}_shipDays`, e.target.value)}
                                                                        placeholder="e.g. 2-3 Days"
                                                                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-gray-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleShippingUpdate(product)}
                                                                disabled={updateLoading[`ship_${product._id}`]}
                                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
                                                            >
                                                                {updateLoading[`ship_${product._id}`] ? 'Saving...' : <><Save className="w-3 h-3" /> Update Shipping</>}
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4"><span className="text-xl">⚠️</span></div>
                        <h3 className="text-lg font-bold text-gray-900">Delete Product?</h3>
                        <p className="text-gray-500 my-4 text-sm">Action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;