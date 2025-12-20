


// import React, { useEffect, useState } from 'react';
// import { FaArrowRightLong } from 'react-icons/fa6';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//     fetchTopRatedProducts,
//     selectTopRated,
//     selectLoading,
//     selectShouldFetchTopRated
// } from './../../redux/slice/productSlice';
// import { useNavigate } from 'react-router';

// const FeaturedProducts = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     // Use separate selectors instead of one object
//     const featuredProducts = useSelector(selectTopRated);
//     const loading = useSelector(selectLoading);
//     const shouldFetch = useSelector(selectShouldFetchTopRated);

//     const [displayProducts, setDisplayProducts] = useState([]);

//     // Fetch if needed
//     useEffect(() => {
//         if (shouldFetch) {
//             dispatch(fetchTopRatedProducts());
//         }
//     }, [dispatch, shouldFetch]);

//     // Handle Session-Based Randomization
//     useEffect(() => {
//         if (!featuredProducts || featuredProducts.length === 0) return;

//         const SESSION_KEY = 'neerman_featured_ids';

//         try {
//             const storedIds = JSON.parse(sessionStorage.getItem(SESSION_KEY));

//             if (storedIds && Array.isArray(storedIds) && storedIds.length > 0) {
//                 const matchedProducts = featuredProducts.filter(p => storedIds.includes(p._id));
//                 if (matchedProducts.length > 0) {
//                     setDisplayProducts(matchedProducts);
//                     return;
//                 }
//             }

//             const shuffled = [...featuredProducts].sort(() => 0.5 - Math.random());
//             const selected = shuffled.slice(0, 4);

//             sessionStorage.setItem(SESSION_KEY, JSON.stringify(selected.map(p => p._id)));
//             setDisplayProducts(selected);

//         } catch (error) {
//             console.error("Session storage error", error);
//             setDisplayProducts(featuredProducts.slice(0, 4));
//         }

//     }, [featuredProducts]);

//     const handleProductClick = (productId) => {
//         navigate(`/product/${productId}`);
//     };

//     const renderProductCard = (product) => (
//         <div
//             key={product._id}
//             onClick={() => handleProductClick(product._id)}
//             className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
//         >
//             {/* Product Image */}
//             <div className="relative h-32 sm:h-48 overflow-hidden bg-gray-100">
//                 <img
//                     src={product.ProductImage}
//                     alt={product.name}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                 />
//             </div>

//             {/* Product Info */}
//             <div className="px-4 py-2">
//                 <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                         <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
//                     </div>
//                 </div>

//                 {/* Brand and Rating */}
//                 <div className="flex items-center justify-between mb-4 mt-1">
//                     <span className="text-sm text-gray-600">
//                         {product.brand || 'No Brand'}
//                     </span>
//                     {product.rating?.average && (
//                         <div className="flex items-center">
//                             <span className="text-yellow-500 mr-1">★</span>
//                             <span className="text-sm font-medium">{product.rating.average}</span>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );

//     // Show loading state
//     if (loading && displayProducts.length === 0) {
//         return (
//             <section className="py-8">
//                 <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
//                     <div className="py-6 bg-gradient-to-r from-purple-100 to-indigo-50 px-3 rounded-3xl">
//                         <div className="flex justify-between items-center mb-8">
//                             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Best Products</h2>
//                             <div className="bg-gray-300 animate-pulse h-8 w-20 rounded-2xl"></div>
//                         </div>
//                         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
//                             {[...Array(4)].map((_, i) => (
//                                 <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
//                                     <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
//                                     <div className="h-4 bg-gray-200 rounded mb-2"></div>
//                                     <div className="h-3 bg-gray-200 rounded w-3/4"></div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </section>
//         );
//     }

//     // Don't render if no products to show yet
//     if (displayProducts.length === 0) return null;

//     return (
//         <section className="py-8">
//             <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
//                 <div className="relative py-6 bg-gradient-to-r from-purple-100 to-indigo-50 px-3 rounded-3xl overflow-hidden mb-8">

//                     {/* Header */}
//                     <div className="flex justify-between items-center mb-8">
//                         <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Best Products</h2>
//                         <button
//                             onClick={() => navigate('/Material_market')}
//                             className="bg-black hover:bg-gray-800 text-white text-xs px-4 py-2 rounded-2xl transition-all duration-300 flex items-center gap-2 group"
//                         >
//                             View All
//                             <FaArrowRightLong className="group-hover:translate-x-1 transition-transform text-sm" />
//                         </button>
//                     </div>

//                     {/* Products Grid */}
//                     <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
//                         {displayProducts.map((product) => renderProductCard(product))}
//                     </div>

//                 </div>
//             </div>
//         </section>
//     );
// };

// export default FeaturedProducts;

import React, { useEffect, useState } from 'react';
import { FaArrowRightLong, FaRegHeart, FaEye, FaStar } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTopRatedProducts,
    selectTopRated,
    selectLoading,
    selectShouldFetchTopRated
} from './../../redux/slice/productSlice';
import { useNavigate } from 'react-router';

const FeaturedProducts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const featuredProducts = useSelector(selectTopRated);
    const loading = useSelector(selectLoading);
    const shouldFetch = useSelector(selectShouldFetchTopRated);

    const [displayProducts, setDisplayProducts] = useState([]);

    // --- Format Currency (INR) ---
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    // --- Calculate Discount ---
    // const getDiscount = (price, mrp) => {
    //     if (!mrp || mrp <= price) return null;
    //     const discount = Math.round(((mrp - price) / mrp) * 100);
    //     return `${discount}% OFF`;
    // };

    useEffect(() => {
        if (shouldFetch) {
            dispatch(fetchTopRatedProducts());
        }
    }, [dispatch, shouldFetch]);

    useEffect(() => {
        if (!featuredProducts || featuredProducts.length === 0) return;
        const SESSION_KEY = 'neerman_featured_ids';
        try {
            const storedIds = JSON.parse(sessionStorage.getItem(SESSION_KEY));
            if (storedIds && Array.isArray(storedIds) && storedIds.length > 0) {
                const matchedProducts = featuredProducts.filter(p => storedIds.includes(p._id));
                if (matchedProducts.length > 0) {
                    setDisplayProducts(matchedProducts);
                    return;
                }
            }
            const shuffled = [...featuredProducts].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 4);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(selected.map(p => p._id)));
            setDisplayProducts(selected);
        } catch (error) {
            setDisplayProducts(featuredProducts.slice(0, 4));
        }
    }, [featuredProducts]);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleWishlist = (e, id) => {
        e.stopPropagation();
        // Add wishlist logic here
        console.log("Added to wishlist", id);
    };

    const renderProductCard = (product) => {
        // Mocking price/mrp if they don't exist in your backend yet for demo purposes
        const price = product.price || 1200;
        const mrp = product.mrp || 1500;
        // const discountBadge = getDiscount(price, mrp);

        return (
            <div
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
            >
                {/* Image Section */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-50">
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                        {/* {discountBadge && (
                            <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                {discountBadge}
                            </span>
                        )} */}
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-gray-100">
                            Top Rated
                        </span>
                    </div>

                    <img
                        src={product.ProductImage}
                        alt={product.name}
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Quick Action Overlay (Appears on Hover) */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                            onClick={(e) => handleWishlist(e, product._id)}
                            className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                            title="Add to Wishlist"
                        >
                            <FaRegHeart />
                        </button>
                        <button
                            className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-blue-50 hover:text-blue-600 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100"
                            title="Quick View"
                        >
                            <FaEye />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-4 pt-4 pb-5">
                    {/* Brand & Rating */}
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {product.brand || 'Neerman Select'}
                        </span>
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md">
                            <FaStar className="text-yellow-400 text-xs" />
                            <span className="text-xs font-bold text-gray-700">{product.rating?.average || 4.5}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 leading-tight mb-2 line-clamp-2 h-10 group-hover:text-purple-700 transition-colors">
                        {product.name}
                    </h3>

                    {/* Price Block
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-lg font-extrabold text-gray-900">
                            {formatPrice(price)}
                        </span>
                        {mrp > price && (
                            <span className="text-xs text-gray-400 line-through mb-1">
                                {formatPrice(mrp)}
                            </span>
                        )}
                    </div> */}
                </div>
            </div>
        );
    };

    // Loading Skeleton
    if (loading && displayProducts.length === 0) {
        return (
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-3xl h-80 border border-gray-100 p-4 animate-pulse shadow-sm">
                                    <div className="h-48 bg-gray-100 rounded-2xl mb-4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (displayProducts.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Container */}
                <div className="relative p-6 sm:p-10 bg-gradient-to-br from-[#F3F4F6] via-[#E0E7FF] to-[#F3E8FF] rounded-[2.5rem] overflow-hidden shadow-sm">

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

                    {/* Header */}
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                                Trending Now
                            </h2>
                            <p className="text-gray-500 mt-1">Top picks for your construction needs</p>
                        </div>
                        <button
                            onClick={() => navigate('/Material_market')}
                            className="group flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-full transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-gray-400"
                        >
                            <span className="font-medium">Explore Market</span>
                            <FaArrowRightLong className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Products Grid */}
                    <div className="relative grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {displayProducts.map((product) => renderProductCard(product))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;