// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router';
// import axiosClient from '../api/auth';
// import toast, { Toaster } from 'react-hot-toast';
// import Navbar from '../components/home/navbar';
// import BottomPart from '../components/home/BottomPart';
// import {
//     Filter, X, Search, ChevronDown, ShoppingCart,
//     Star, ArrowRight, Heart
// } from 'lucide-react';

// const FilterSection = ({ filters, availableFilters, handleFilterChange, clearFilters, setShowMobileFilters, mobile = false }) => (
//     <div className={`space-y-6 ${mobile ? 'p-4' : ''}`}>
//         {/* Header for Mobile */}
//         {mobile && (
//             <div className="flex justify-between items-center mb-6 pb-4 border-b">
//                 <h2 className="text-xl font-bold">Filters</h2>
//                 <button onClick={() => setShowMobileFilters(false)}>
//                     <X className="w-6 h-6" />
//                 </button>
//             </div>
//         )}

//         {/* Search (Sidebar version) */}
//         <div>
//             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Search</h3>
//             <div className="relative">
//                 <input
//                     type="text"
//                     placeholder="Search materials..."
//                     value={filters.search}
//                     onChange={(e) => handleFilterChange('search', e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//                 <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
//             </div>
//         </div>

//         {/* Price Range */}
//         <div>
//             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Price Range</h3>
//             <div className="flex items-center gap-2">
//                 <input
//                     type="number"
//                     placeholder="Min"
//                     value={filters.minPrice}
//                     onChange={(e) => handleFilterChange('minPrice', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-lg text-sm"
//                 />
//                 <span className="text-gray-400">-</span>
//                 <input
//                     type="number"
//                     placeholder="Max"
//                     value={filters.maxPrice}
//                     onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-lg text-sm"
//                 />
//             </div>
//         </div>

//         {/* Category */}
//         <div>
//             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
//             <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
//                 <label className="flex items-center gap-2 cursor-pointer group">
//                     <input
//                         type="radio"
//                         name="category"
//                         checked={filters.category === ''}
//                         onChange={() => handleFilterChange('category', '')}
//                         className="text-blue-600 focus:ring-blue-500"
//                     />
//                     <span className="text-sm text-gray-600 group-hover:text-blue-600">All Categories</span>
//                 </label>
//                 {availableFilters.categories.map(cat => (
//                     <label key={cat} className="flex items-center gap-2 cursor-pointer group">
//                         <input
//                             type="radio"
//                             name="category"
//                             checked={filters.category === cat}
//                             onChange={() => handleFilterChange('category', cat)}
//                             className="text-blue-600 focus:ring-blue-500"
//                         />
//                         <span className="text-sm text-gray-600 group-hover:text-blue-600">{cat}</span>
//                     </label>
//                 ))}
//             </div>
//         </div>

//         {/* Brand */}
//         <div>
//             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Brands</h3>
//             <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
//                 <label className="flex items-center gap-2 cursor-pointer group">
//                     <input
//                         type="radio"
//                         name="brand"
//                         checked={filters.brand === ''}
//                         onChange={() => handleFilterChange('brand', '')}
//                         className="text-blue-600 focus:ring-blue-500"
//                     />
//                     <span className="text-sm text-gray-600 group-hover:text-blue-600">All Brands</span>
//                 </label>
//                 {availableFilters.brands.map(brand => (
//                     <label key={brand} className="flex items-center gap-2 cursor-pointer group">
//                         <input
//                             type="radio"
//                             name="brand"
//                             checked={filters.brand === brand}
//                             onChange={() => handleFilterChange('brand', brand)}
//                             className="text-blue-600 focus:ring-blue-500"
//                         />
//                         <span className="text-sm text-gray-600 group-hover:text-blue-600">{brand}</span>
//                     </label>
//                 ))}
//             </div>
//         </div>

//         {/* Availability */}
//         <div className="pt-2 border-t">
//             <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                     type="checkbox"
//                     checked={filters.inStock}
//                     onChange={(e) => handleFilterChange('inStock', e.target.checked)}
//                     className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
//                 />
//                 <span className="text-sm font-medium text-gray-700">Exclude Out of Stock</span>
//             </label>
//         </div>

//         <button
//             onClick={clearFilters}
//             className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
//         >
//             Clear All Filters
//         </button>
//     </div>
// );

// const ProductListing = () => {
//     // State
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showMobileFilters, setShowMobileFilters] = useState(false);

//     // Filter State
//     const [filters, setFilters] = useState({
//         search: '',
//         category: '',
//         minPrice: '',
//         maxPrice: '',
//         brand: '',
//         inStock: false
//     });

//     const [sortBy, setSortBy] = useState('createdAt');
//     const [sortOrder, setSortOrder] = useState('desc');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [totalProducts, setTotalProducts] = useState(0);

//     const [availableFilters, setAvailableFilters] = useState({
//         categories: [],
//         brands: []
//     });

//     const sortOptions = [
//         { value: 'createdAt_desc', label: 'Newest First' },
//         { value: 'price_asc', label: 'Price: Low to High' },
//         { value: 'price_desc', label: 'Price: High to Low' },
//         { value: 'rating_desc', label: 'Popularity' }
//     ];

//     // Effects
//     useEffect(() => {
//         fetchProducts();
//         // fetchAvailableFilters();
//     }, [filters, sortBy, sortOrder, currentPage]);

//     useEffect(() => {
//         fetchAvailableFilters();
//     }, []);


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

//             // Simulating API delay to show skeleton (remove in production)
//             // await new Promise(resolve => setTimeout(resolve, 800));

//             const response = await axiosClient.get('/products/public/products', { params });
//             setProducts(response.data.products);
//             setTotalPages(response.data.pagination.totalPages);
//             setTotalProducts(response.data.pagination.totalItems || 0);
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
//             if (response.data.filters) {
//                 setAvailableFilters(response.data.filters);
//             }
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

//     const handleSortChange = (e) => {
//         const [field, order] = e.target.value.split('_');
//         setSortBy(field);
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
//             inStock: false
//         });
//         setCurrentPage(1);
//     };

//     const addToCart = (e, product) => {
//         e.preventDefault(); // Prevent navigation to detail page
//         toast.success(`${product.name} added to cart!`);
//     };

//     // Components lazy card
//     const SkeletonCard = () => (
//         <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
//             <div className="h-48 bg-gray-200" />
//             <div className="p-4 space-y-3">
//                 <div className="h-4 bg-gray-200 rounded w-3/4" />
//                 <div className="h-3 bg-gray-200 rounded w-1/2" />
//                 <div className="flex justify-between items-center pt-2">
//                     <div className="h-5 bg-gray-200 rounded w-1/3" />
//                     <div className="h-8 bg-gray-200 rounded w-8" />
//                 </div>
//             </div>
//         </div>
//     );



//     return (
//         <div className="min-h-screen bg-[#f1f2f4] pb-20"> {/* Subtle gray background like Flipkart */}
//             <Toaster position="bottom-center" />
//             <Navbar />

//             <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">

//                 {/* Mobile Filter Toggle & Sort Bar */}
//                 <div className="lg:hidden sticky top-[60px] z-30 bg-white shadow-sm p-3 mb-4 rounded-lg flex justify-between items-center">
//                     <button
//                         onClick={() => setShowMobileFilters(true)}
//                         className="flex items-center gap-2 text-sm font-semibold text-gray-700"
//                     >
//                         <Filter className="w-4 h-4" /> Filters
//                     </button>
//                     <select
//                         value={`${sortBy}_${sortOrder}`}
//                         onChange={handleSortChange}
//                         className="border-none text-sm font-semibold bg-transparent focus:ring-0 text-right"
//                     >
//                         {sortOptions.map(option => (
//                             <option key={option.value} value={option.value}>{option.label}</option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="flex gap-6">
//                     {/* DESKTOP SIDEBAR */}
//                     <aside className="hidden lg:block w-64 flex-shrink-0">
//                         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-lg font-bold text-gray-900">Filters</h2>
//                                 <button onClick={clearFilters} className="text-xs text-blue-600 font-medium hover:underline">CLEAR ALL</button>
//                             </div>
//                             <FilterSection
//                                 filters={filters}
//                                 availableFilters={availableFilters}
//                                 handleFilterChange={handleFilterChange}
//                                 clearFilters={clearFilters}
//                                 setShowMobileFilters={setShowMobileFilters}
//                             />
//                         </div>
//                     </aside>

//                     {/* MAIN CONTENT */}
//                     <main className="flex-1 min-w-0">
//                         {/* Header & Desktop Sort */}
//                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4 hidden lg:flex justify-between items-center">
//                             <div>
//                                 <h1 className="text-xl font-bold text-gray-900">Building Materials</h1>
//                                 <p className="text-sm text-gray-500 mt-1">Showing {loading ? '...' : totalProducts} products</p>
//                             </div>
//                             <div className="flex items-center gap-3">
//                                 <span className="text-sm text-gray-500">Sort By:</span>
//                                 <select
//                                     value={`${sortBy}_${sortOrder}`}
//                                     onChange={handleSortChange}
//                                     className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 py-1.5"
//                                 >
//                                     {sortOptions.map(option => (
//                                         <option key={option.value} value={option.value}>{option.label}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         {/* PRODUCT GRID */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4">
//                             {loading ? (
//                                 Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
//                             ) : products.length === 0 ? (
//                                 <div className="col-span-full bg-white rounded-xl p-12 text-center shadow-sm">
//                                     <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                                         <Search className="w-10 h-10 text-gray-400" />
//                                     </div>
//                                     <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
//                                     <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
//                                     <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
//                                         Reset Filters
//                                     </button>
//                                 </div>
//                             ) : (
//                                 products.map((product) => (
//                                     <div key={product._id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col relative">
//                                         {/* Badge for Stock/Offer */}
//                                         {product.stock === 0 && (
//                                             <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
//                                                 SOLD OUT
//                                             </div>
//                                         )}
//                                         {product.costPrice > product.price && (
//                                             <div className="absolute top-3 left-3 bg-green-500/40 rounded-2xl text-white text-[10px] font-bold px-2 py-1  z-10">
//                                                 {Math.round(((product.costPrice - product.price) / product.costPrice) * 100)}% OFF
//                                             </div>
//                                         )}

//                                         <Link to={`/product/${product._id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
//                                             {product.ProductImage ? (
//                                                 <img
//                                                     src={product.ProductImage}
//                                                     alt={product.name}
//                                                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                                                 />
//                                             ) : (
//                                                 <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-4xl">
//                                                     {product.name?.[0]}
//                                                 </div>
//                                             )}
//                                             {/* Quick Add Button (Visible on Hover) */}
//                                             {product.stock > 0 && (
//                                                 <button
//                                                     onClick={(e) => addToCart(e, product)}
//                                                     className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white"
//                                                     title="Add to Cart"
//                                                 >
//                                                     <ShoppingCart className="w-5 h-5" />
//                                                 </button>
//                                             )}
//                                         </Link>

//                                         <div className="p-4 flex flex-col flex-1">
//                                             <div className="flex-1">
//                                                 <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
//                                                     {product.brand || 'Generic'}
//                                                 </p>
//                                                 <Link to={`/product/${product._id}`}>
//                                                     <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors mb-2" title={product.name}>
//                                                         {product.name}
//                                                     </h3>
//                                                 </Link>

//                                                 {/* Rating Simulation */}
//                                                 <div className="flex items-center gap-1 ">
//                                                     <div className="bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
//                                                         {product?.rating?.average} <Star className="w-2 h-2 fill-current" />
//                                                     </div>
//                                                     <span className="text-xs text-gray-400">{product?.rating?.count}</span>
//                                                 </div>
//                                             </div>

//                                             <div className="mt-2  border-t border-gray-50">
//                                                 <div className="flex items-baseline gap-2">
//                                                     <span className="text-lg font-bold text-gray-900">₹{product?.price?.toLocaleString()}</span>
//                                                     {product.costPrice && (
//                                                         <span className="text-xs text-gray-400 line-through">₹{product?.costPrice?.toLocaleString()}</span>
//                                                     )}
//                                                 </div>
//                                                 <p className="text-xs text-green-600 font-medium mt-0.5">Free Delivery</p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))
//                             )}
//                         </div>

//                         {/* Pagination */}
//                         {totalPages > 1 && (
//                             <div className="mt-8 flex justify-center pb-8">
//                                 <nav className="flex items-center gap-1 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
//                                     <button
//                                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                                         disabled={currentPage === 1}
//                                         className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 disabled:opacity-50"
//                                     >
//                                         Prev
//                                     </button>
//                                     {[...Array(totalPages)].map((_, i) => (
//                                         <button
//                                             key={i}
//                                             onClick={() => setCurrentPage(i + 1)}
//                                             className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${currentPage === i + 1
//                                                 ? 'bg-blue-600 text-white'
//                                                 : 'text-gray-700 hover:bg-gray-100'
//                                                 }`}
//                                         >
//                                             {i + 1}
//                                         </button>
//                                     ))}
//                                     <button
//                                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                                         disabled={currentPage === totalPages}
//                                         className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 disabled:opacity-50"
//                                     >
//                                         Next
//                                     </button>
//                                 </nav>
//                             </div>
//                         )}
//                     </main>
//                 </div>
//             </div>

//             {/* Mobile Filter Drawer */}
//             {showMobileFilters && (
//                 <div className="fixed inset-0 z-50 lg:hidden">
//                     <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
//                     <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
//                         <FilterSection
//                             filters={filters}
//                             availableFilters={availableFilters}
//                             handleFilterChange={handleFilterChange}
//                             clearFilters={clearFilters}
//                             setShowMobileFilters={setShowMobileFilters}
//                         />
//                     </div>
//                 </div>
//             )}

//             <div className="fixed bottom-0 w-full z-40">
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
    Filter, X, Search, ShoppingCart,
    Star, Layers
} from 'lucide-react';

const FilterSection = ({ filters, availableFilters, handleFilterChange, clearFilters, setShowMobileFilters, mobile = false }) => (
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

        {/* Search */}
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
                {availableFilters?.categories?.map(cat => (
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
                {availableFilters?.brands?.map(brand => (
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
        inStock: false
    });

    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const [availableFilters, setAvailableFilters] = useState({
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 0 }
    });

    const sortOptions = [
        { value: 'createdAt_desc', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'rating.average_desc', label: 'Popularity' }
    ];

    // Effects
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
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
            setTotalProducts(response.data.pagination.totalProducts || 0);

            // Update available filters from backend response
            if (response.data.filters) {
                setAvailableFilters(response.data.filters);
            }

        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
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
        e.preventDefault();
        // Logic to add default variant or open modal
        toast.success(`${product.name} added to cart!`);
    };

    // Helper to calculate display price, discount, etc. from variants
    const getProductDisplayInfo = (product) => {
        if (!product.variants || product.variants.length === 0) return { price: 0, discount: 0, label: 'Unavailable' };

        // Find variant with lowest price to display "Starts from"
        const prices = product.variants.map(v => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Find variant with highest discount (visual appeal)
        let maxDiscount = 0;
        product.variants.forEach(v => {
            if (v.costPrice && v.costPrice > v.price) {
                const discount = Math.round(((v.costPrice - v.price) / v.costPrice) * 100);
                if (discount > maxDiscount) maxDiscount = discount;
            }
        });

        // Determine matching variant for cost price display (of the min price one)
        const minPriceVariant = product.variants.find(v => v.price === minPrice);
        const costPrice = minPriceVariant?.costPrice;

        return {
            price: minPrice,
            maxPrice: maxPrice,
            isRange: minPrice !== maxPrice,
            costPrice: costPrice,
            discount: maxDiscount,
            totalStock: product.totalStock // From backend virtual
        };
    };

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

    return (
        <div className="min-h-screen bg-[#f1f2f4] pb-20">
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
                            <FilterSection
                                filters={filters}
                                availableFilters={availableFilters}
                                handleFilterChange={handleFilterChange}
                                clearFilters={clearFilters}
                                setShowMobileFilters={setShowMobileFilters}
                            />
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
                                products.map((product) => {
                                    const { price, isRange, maxPrice, costPrice, discount, totalStock } = getProductDisplayInfo(product);

                                    return (
                                        <div key={product._id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col relative">

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                                                {totalStock === 0 && (
                                                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                        SOLD OUT
                                                    </div>
                                                )}
                                                {discount > 0 && totalStock > 0 && (
                                                    <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                        {discount}% OFF
                                                    </div>
                                                )}
                                            </div>

                                            {/* Multiple Variants Indicator */}
                                            {isRange && (
                                                <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                    <Layers className="w-3 h-3" />
                                                    {product.variants.length} Options
                                                </div>
                                            )}

                                            <Link to={`/product/${product._id}`} className="block relative aspect-square bg-gray-50 overflow-hidden group">
                                                {product.ProductImage ? (
                                                    <img
                                                        src={product.ProductImage}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-4xl bg-gray-100">
                                                        {product.name?.[0]}
                                                    </div>
                                                )}

                                                {/* Hover Action */}
                                                {totalStock > 0 && (
                                                    <button
                                                        onClick={(e) => addToCart(e, product)}
                                                        className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white"
                                                        title="Quick Add"
                                                    >
                                                        <ShoppingCart className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </Link>

                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                                            {product.brand || 'Generic'}
                                                        </p>
                                                        {product.rating && (
                                                            <div className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-100">
                                                                {product.rating.average} <Star className="w-2 h-2 fill-current" />
                                                                <span className="text-gray-400 font-normal">({product.rating.count})</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Link to={`/product/${product._id}`}>
                                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors mb-2" title={product.name}>
                                                            {product.name}
                                                        </h3>
                                                    </Link>

                                                    {/* Category Tag */}
                                                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full mb-2">
                                                        {product.category}
                                                    </span>
                                                </div>

                                                <div className="mt-2 border-t border-gray-50 pt-2">
                                                    <div className="flex items-baseline flex-wrap gap-2">
                                                        <span className="text-lg font-bold text-gray-900">
                                                            {isRange ? `₹${price.toLocaleString()} - ₹${maxPrice.toLocaleString()}` : `₹${price.toLocaleString()}`}
                                                        </span>
                                                        {costPrice && costPrice > price && !isRange && (
                                                            <span className="text-xs text-gray-400 line-through">₹{costPrice.toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-xs text-green-600 font-medium">
                                                            {product.shipping?.isFree ? 'Free Delivery' : 'Standard Shipping'}
                                                        </p>
                                                        {isRange && (
                                                            <span className="text-[10px] text-blue-600 font-medium">
                                                                View Options
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
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
                        <FilterSection
                            filters={filters}
                            availableFilters={availableFilters}
                            handleFilterChange={handleFilterChange}
                            clearFilters={clearFilters}
                            setShowMobileFilters={setShowMobileFilters}
                            mobile={true}
                        />
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